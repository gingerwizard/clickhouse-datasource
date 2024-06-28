import React from 'react';
import { GenericConfigSection, Props as GenericConfigSectionProps } from './GenericConfigSection';

type Props = Omit<GenericConfigSectionProps, 'kind'>;

export const ConfigSubSection = ({ children, ...props }: Props) => {
  return (
    <GenericConfigSection {...props} kind="sub-section">
      {children}
    </GenericConfigSection>
  );
};
