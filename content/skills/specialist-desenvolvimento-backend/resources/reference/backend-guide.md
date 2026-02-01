# Guia Completo - Desenvolvimento Backend

## Clean Architecture

### Camadas
1. **Controllers:** Rotas HTTP
2. **Services:** Lógica de negócio
3. **Repositories:** Acesso a dados
4. **Entities:** Modelos de domínio

### Fluxo
```
Request → Controller → Service → Repository → Database
Response ← Controller ← Service ← Repository ← Database
```

---

## SOLID Principles

- **S**ingle Responsibility
- **O**pen/Closed
- **L**iskov Substitution
- **I**nterface Segregation
- **D**ependency Inversion

---

## NestJS Best Practices

### DTOs com Validação
```typescript
export class CreateUserDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsEmail()
  email: string;
}
```

### Error Handling
```typescript
throw new BadRequestException('Invalid email');
throw new NotFoundException('User not found');
throw new UnauthorizedException('Invalid credentials');
```

---

## Testing Strategies

### Unit Tests
```typescript
describe('UsersService', () => {
  it('should create user', async () => {
    const dto = { name: 'John', email: 'john@example.com' };
    const result = await service.create(dto);
    expect(result).toBeDefined();
  });
});
```

### Integration Tests
```typescript
describe('Users (e2e)', () => {
  it('/users (POST)', () => {
    return request(app.getHttpServer())
      .post('/users')
      .send({ name: 'John', email: 'john@example.com' })
      .expect(201);
  });
});
```

---

## Security Hardening

- JWT Authentication
- Role-based Authorization
- Input Sanitization
- SQL Injection Prevention
- Rate Limiting
- CORS Configuration
