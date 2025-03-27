import { faker } from '@faker-js/faker';
import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppModule } from './app.module';
import { User } from './modules/account-management/users/entities/user.entity';

async function generateFakeData() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userRepository = app.get<Repository<User>>(getRepositoryToken(User));

  const users: Partial<User>[] = [];

  for (let i = 0; i < 100; i++) {
    const user = new User({
      email: faker.internet.email(),
      password: faker.internet.password(),
      userName: faker.internet.userName(),
      lastLogin: faker.date.recent(),
      phoneNumber: faker.phone.number(),
      accessFailedCount: faker.number.int({ min: 0, max: 5 }),
    });

    users.push(user);
  }

  await userRepository.save(users);
  console.log('Fake data generated successfully');
  await app.close();
}

generateFakeData().catch((error) => {
  console.error('Error generating fake data', error);
  process.exit(1);
});