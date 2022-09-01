import React, { useState } from 'react';
import { InlineFormLabel, Input } from '@grafana/ui';
import { selectors } from './../../selectors';

interface LimitEditorProps {
  limit: number;
  onLimitChange: (limit: number) => void;
}
export const LimitEditor = (props: LimitEditorProps) => {
  const [limit, setLimit] = useState(props.limit || 10);
  const { label, tooltip } = selectors.components.QueryEditor.QueryBuilder.LIMIT;
  return (
    <div className="gf-form">
      <InlineFormLabel width={8} className="query-keyword" tooltip={tooltip}>
        {label}
      </InlineFormLabel>
      <Input
        width={10}
        value={limit}
        type="number"
        min={1}
        onChange={(e) => setLimit(e.currentTarget.valueAsNumber)}
        onBlur={() => props.onLimitChange(limit)}
      />
    </div>
  );
};
