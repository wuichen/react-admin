import React from "react";
import {
  List,
  Datagrid,
  TextField,
  DateField,
  ReferenceField,
  NumberField,
  Filter,
  DateInput,
} from "react-admin";

import FullNameField from "../visitors/FullNameField";
import AddressField from "../visitors/AddressField";
import InvoiceShow from "./InvoiceShow";

const ListFilters = (props: any) => (
  <Filter {...props}>
    <DateInput source="date_gte" alwaysOn />
    <DateInput source="date_lte" alwaysOn />
  </Filter>
);

const InvoiceList = (props: any) => (
  <List {...props} filters={<ListFilters />} perPage={25}>
    <Datagrid rowClick="expand" expand={<InvoiceShow />}>
      <TextField source="id" />
      <DateField source="date" />
      <ReferenceField source="customerId" reference="customer">
        <FullNameField />
      </ReferenceField>
      <ReferenceField
        source="customerId"
        reference="customer"
        link={false}
        label="resources.invoices.fields.address"
      >
        <AddressField />
      </ReferenceField>
      <ReferenceField source="commandId" reference="command">
        <TextField source="reference" />
      </ReferenceField>
      <NumberField source="total_ex_taxes" />
      <NumberField source="delivery_fees" />
      <NumberField source="taxes" />
      <NumberField source="total" />
    </Datagrid>
  </List>
);

export default InvoiceList;
