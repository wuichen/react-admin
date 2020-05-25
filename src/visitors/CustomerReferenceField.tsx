import React, { FC } from "react";
import { ReferenceField } from "react-admin";

import FullNameField from "./FullNameField";
import { FieldProps } from "../types";

const CustomerReferenceField: FC<FieldProps> = (props) => (
  <ReferenceField source="customerId" reference="customer" {...props}>
    <FullNameField />
  </ReferenceField>
);

CustomerReferenceField.defaultProps = {
  source: "customerId",
  addLabel: true,
};

export default CustomerReferenceField;
