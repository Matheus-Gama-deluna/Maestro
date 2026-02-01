# Exemplos Práticos - Desenvolvimento Backend

## Exemplo 1: CRUD Completo (NestJS)

**Controller:**
```typescript
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  findAll(@Query() query: PaginationDto) {
    return this.usersService.findAll(query);
  }

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }
}
```

**Service:**
```typescript
@Injectable()
export class UsersService {
  constructor(private usersRepo: UsersRepository) {}

  async create(dto: CreateUserDto): Promise<User> {
    const user = this.usersRepo.create(dto);
    return this.usersRepo.save(user);
  }
}
```

**Repository:**
```typescript
@Injectable()
export class UsersRepository extends Repository<User> {
  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ where: { email } });
  }
}
```

---

## Exemplo 2: Authentication Service

**Service:**
```typescript
@Injectable()
export class AuthService {
  async login(dto: LoginDto): Promise<{ token: string }> {
    const user = await this.usersService.validateUser(dto);
    const token = this.jwtService.sign({ sub: user.id });
    return { token };
  }
}
```

---

## Exemplo 3: Payment Integration

**Service:**
```typescript
@Injectable()
export class PaymentService {
  async processPayment(dto: PaymentDto): Promise<PaymentResult> {
    const charge = await this.stripeClient.charges.create({
      amount: dto.amount,
      currency: 'usd',
      source: dto.token,
    });
    return { success: true, chargeId: charge.id };
  }
}
```

---

## Exemplo 4: Background Jobs

**Processor:**
```typescript
@Processor('emails')
export class EmailProcessor {
  @Process('send')
  async sendEmail(job: Job<SendEmailDto>) {
    await this.emailService.send(job.data);
  }
}
```

---

## Exemplo 5: Caching Layer

**Service:**
```typescript
@Injectable()
export class ProductsService {
  @Cacheable('products', 3600)
  async findAll(): Promise<Product[]> {
    return this.productsRepo.find();
  }
}
```
