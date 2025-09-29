# Valibot Documentation

![Valibot Logo](https://github.com/fabian-hiller/valibot/blob/main/valibot.jpg?raw=true)

## Overview

**Valibot** is a modular and type-safe schema library for validating
structural data in TypeScript. It provides a modern alternative to other
validation libraries with a focus on bundle size optimization, developer
experience, and type safety.

- **GitHub Repository**:
  [fabian-hiller/valibot](https://github.com/fabian-hiller/valibot)
- **Official Website**: [valibot.dev](https://valibot.dev/)
- **NPM Package**: [valibot](https://www.npmjs.com/package/valibot)
- **Latest Version**: 1.1.0
- **License**: MIT
- **Discord Community**: [Join Discord](https://discord.gg/tkMjQACf2P)

## Key Highlights

### 🔒 **Fully Type Safe**

- Complete TypeScript support with static type inference
- Runtime validation that guarantees type safety of unknown data
- Inferred types from schemas automatically

### 📦 **Small Bundle Size**

- Starting at less than 700 bytes
- Modular design allows tree-shaking unused code
- Up to 95% smaller bundle size compared to Zod
- Each function has a single responsibility

### 🚧 **Validate Everything**

- Supports primitive values to complex nested objects
- Arrays, objects, unions, intersections, and more
- Custom validation actions and transformations
- Built-in validation helpers included

### 🛟 **100% Test Coverage**

- Open source with comprehensive test suite
- Well-structured source code without dependencies
- Battle-tested in production environments

### 🧑‍💻 **Great Developer Experience**

- Minimal, readable, and intuitive API
- Excellent TypeScript IntelliSense support
- Clear error messages and debugging

## Installation

```bash
# npm
npm install valibot

# yarn
yarn add valibot

# pnpm
pnpm add valibot

# bun
bun add valibot
```

## Basic Usage

### Creating a Schema

```typescript
import * as v from 'valibot'; // Only 1.31 kB

// Create a login schema
const LoginSchema = v.object({
  email: v.pipe(v.string(), v.email()),
  password: v.pipe(v.string(), v.minLength(8)),
});

// Infer TypeScript type from schema
type LoginData = v.InferOutput<typeof LoginSchema>;
// Result: { email: string; password: string }
```

### Parsing Data

```typescript
// Parse with exceptions (throws on invalid data)
try {
  const result = v.parse(LoginSchema, {
    email: 'jane@example.com',
    password: '12345678',
  });
  console.log(result); // { email: 'jane@example.com', password: '12345678' }
} catch (error) {
  console.error('Validation failed:', error);
}

// Safe parsing (returns result object)
const result = v.safeParse(LoginSchema, {
  email: 'invalid-email',
  password: '123',
});

if (result.success) {
  console.log('Valid data:', result.output);
} else {
  console.log('Validation errors:', result.issues);
}

// Type guard function
if (v.is(LoginSchema, unknownData)) {
  // unknownData is now typed as LoginData
  console.log(unknownData.email); // TypeScript knows this is a string
}
```

## Common Schema Types

### Primitives

```typescript
const StringSchema = v.string();
const NumberSchema = v.number();
const BooleanSchema = v.boolean();
const DateSchema = v.date();
```

### Objects

```typescript
const UserSchema = v.object({
  id: v.number(),
  name: v.string(),
  email: v.pipe(v.string(), v.email()),
  age: v.optional(v.number()),
  isActive: v.boolean(),
});
```

### Arrays

```typescript
const NumberArraySchema = v.array(v.number());
const UserArraySchema = v.array(UserSchema);
```

### Unions and Literals

```typescript
const StatusSchema = v.union([
  v.literal('pending'),
  v.literal('approved'),
  v.literal('rejected'),
]);

const MixedUnionSchema = v.union([v.string(), v.number(), v.boolean()]);
```

## Validation Actions

### Built-in Validators

```typescript
const EmailSchema = v.pipe(
  v.string(),
  v.email(), // Email validation
  v.minLength(5),
  v.maxLength(50),
);

const PasswordSchema = v.pipe(
  v.string(),
  v.minLength(8),
  v.maxLength(128),
  v.regex(/^(?=.*[A-Za-z])(?=.*\d)/), // At least one letter and one number
);

const AgeSchema = v.pipe(
  v.number(),
  v.integer(),
  v.minValue(0),
  v.maxValue(120),
);
```

### Custom Validators

```typescript
const CustomSchema = v.pipe(
  v.string(),
  v.custom(value => {
    return value.includes('custom') ? true : 'Must contain "custom"';
  }),
);
```

## Transformations

```typescript
const TransformSchema = v.pipe(
  v.string(),
  v.transform(value => value.toUpperCase()),
  v.transform(value => value.trim()),
);
```

## Advanced Patterns

### Nested Objects

```typescript
const AddressSchema = v.object({
  street: v.string(),
  city: v.string(),
  country: v.string(),
  zipCode: v.string(),
});

const PersonSchema = v.object({
  name: v.string(),
  address: AddressSchema,
  alternativeAddresses: v.array(AddressSchema),
});
```

### Recursive Schemas

```typescript
const CategorySchema: v.BaseSchema<Category> = v.object({
  id: v.number(),
  name: v.string(),
  subcategories: v.array(v.lazy(() => CategorySchema)),
});
```

### Conditional Validation

```typescript
const ConditionalSchema = v.object({
  type: v.union([v.literal('user'), v.literal('admin')]),
  permissions: v.optional(v.union([v.array(v.string()), v.null()])),
});
```

## Error Handling

```typescript
const result = v.safeParse(UserSchema, invalidData);

if (!result.success) {
  result.issues.forEach(issue => {
    console.log(`Path: ${issue.path?.map(p => p.key).join('.')}`);
    console.log(`Message: ${issue.message}`);
    console.log(`Expected: ${issue.expected}`);
    console.log(`Received: ${issue.received}`);
  });
}
```

## Performance Tips

### Tree Shaking

Valibot's modular design allows for optimal tree shaking:

```typescript
// Only imports what you need
import { object, string, number, parse } from 'valibot';

// vs importing everything
import * as v from 'valibot';
```

### Schema Reuse

Cache schemas for better performance:

```typescript
// ❌ Creates new schema on every call
function validateUser(data: unknown) {
  return v.parse(v.object({ name: v.string() }), data);
}

// ✅ Reuses cached schema
const UserSchema = v.object({ name: v.string() });
function validateUser(data: unknown) {
  return v.parse(UserSchema, data);
}
```

## Comparison with Other Libraries

### vs Zod

| Feature      | Valibot              | Zod             |
| ------------ | -------------------- | --------------- |
| Bundle Size  | ~700 bytes (modular) | ~12.9 kB (full) |
| API Design   | Functional, modular  | Method chaining |
| Tree Shaking | Excellent            | Limited         |
| TypeScript   | Full support         | Full support    |
| Performance  | Optimized            | Good            |

### Migration from Zod

```typescript
// Zod
const ZodSchema = z.object({
  email: z.string().email(),
  age: z.number().min(18),
});

// Valibot equivalent
const ValibotSchema = v.object({
  email: v.pipe(v.string(), v.email()),
  age: v.pipe(v.number(), v.minValue(18)),
});
```

## Community and Support

- **GitHub Issues**:
  [Report bugs or request features](https://github.com/fabian-hiller/valibot/issues)
- **Discord Community**: [Join discussions](https://discord.gg/tkMjQACf2P)
- **Documentation**: [Complete guides](https://valibot.dev/guides/)
- **Playground**: [Try online](https://valibot.dev/playground/)

## Statistics

- **Weekly Downloads**: ~1.96 million
- **GitHub Stars**: 8k+
- **Used by**: 80.8k+ repositories
- **Contributors**: 176+
- **Dependencies**: 0

## Credits

Valibot was created by [Fabian Hiller](https://github.com/fabian-hiller) as
part of his bachelor thesis at Stuttgart Media University, supervised by
Walter Kriha, [Miško Hevery](https://github.com/mhevery), and
[Ryan Carniato](https://github.com/ryansolid). The API design was
influenced by [Colin McDonnell](https://github.com/colinhacks)'s work on
[Zod](https://zod.dev/).

## License

Valibot is completely free and licensed under the
[MIT License](https://github.com/fabian-hiller/valibot/blob/main/LICENSE.md).

---

_Last updated: September 2025_ _For the most current information, visit
[valibot.dev](https://valibot.dev/)_
