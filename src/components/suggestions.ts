import { getTemplateSrv } from '@grafana/runtime';
import { Range, SchemaKind, Suggestion } from './sqlProvider';

export interface Schema {
  databases: () => Promise<string[]>;
  tables: (db?: string) => Promise<string[]>;
  fields: (table: string) => Promise<string[]>;
  defaultDatabase?: string;
}

export async function fetchSuggestions(text: string, schema: Schema, range: Range): Promise<Suggestion[]> {
  if (isAfterDollar(text)) {
    return getVariableSuggestions(range);
  }

  const upperText = text.toUpperCase();
  if (upperText.endsWith('SELECT ') || upperText.endsWith('FROM ')) {
    if (schema.defaultDatabase !== undefined) {
      return fetchTableSuggestions(schema, range);
    }
    return fetchDatabaseSuggestions(schema, range);
  }

  if (text.endsWith('.')) {
    const parts = text.split(' ');
    const current = parts[parts.length - 1];
    const subparts = current.split('.');
    if (schema.defaultDatabase !== undefined) {
      // table. scenario - fetch the fields for the table
      const table = subparts[0];
      return fetchFieldSuggestions(schema, range, table);
    }
    // no default database defined - assume db.table.field
    if (subparts.length === 2) {
      // show tables
      const db = subparts[0];
      return fetchTableSuggestions(schema, range, db);
    }
    // show fields
    const table = subparts[1];
    return fetchFieldSuggestions(schema, range, table);
  }
  return [];
}

async function fetchDatabaseSuggestions(schema: Schema, range: Range) {
  const databases = await schema.databases();
  return databases.map(val => ({
    label: val,
    kind: SchemaKind.DATABASE,
    documentation: 'Database',
    insertText: val,
    range,
  }));
}

async function fetchTableSuggestions(schema: Schema, range: Range, database?: string) {
  const tables = await schema.tables(database);
  return tables.map(val => ({
    label: val,
    kind: SchemaKind.TABLE,
    documentation: 'Table',
    insertText: val,
    range,
  }));
}

async function fetchFieldSuggestions(schema: Schema, range: Range, table: string) {
  const fields = await schema.fields(table);
  return fields.map(val => ({
    label: val,
    kind: SchemaKind.FIELD,
    documentation: 'Field',
    insertText: val,
    range,
  }));
}

function getVariableSuggestions(range: Range) {
  const templateSrv = getTemplateSrv();
  if (!templateSrv) {
    return [];
  }
  return templateSrv.getVariables().map(variable => {
    const label = `\${${variable.name}}`;
    const val = templateSrv.replace(label);
    return {
      label,
      detail: `(Template Variable) ${val}`,
      kind: SchemaKind.VARIABLE,
      documentation: `(Template Variable) ${val}`,
      insertText: `{${variable.name}}`,
      range,
    };
  });
}

function isAfterDollar(text: string) {
  return /^select.*\$$/i.test(text);
}