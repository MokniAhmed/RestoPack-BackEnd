const { Kind } = require('graphql/language')


export const parseLiteral =  (ast: any) => {
  switch (ast.kind) {
    case Kind.BOOLEAN:
    case Kind.STRING:  
      return ast.value
    case Kind.INT:
    case Kind.FLOAT:
      return Number(ast.value)
    case Kind.LIST:
      return ast.values.map(parseLiteral)
    case Kind.OBJECT:
      return ast.fields.reduce((accumulator: any, field :any) => {
        accumulator[field.name.value] = parseLiteral(field.value)
        return accumulator
      }, {})
    case Kind.NULL:
        return null
    default:
      throw new Error(`Unexpected kind in parseLiteral: ${ast.kind}`)
  }
}