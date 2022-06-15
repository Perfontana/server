export const joiValidator =
  ({ schema }: any) =>
  (data: {}) =>
    schema.validate(data);
