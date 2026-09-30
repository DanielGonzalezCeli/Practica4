import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

const CATALOGO = [
  { id: 1, nombre: 'Teclado mecánico', precio: 45.9 },
  { id: 3, nombre: 'Teclado inalámbrico hp', precio: 75.5 },
  { id: 4, nombre: 'MacBook Pro', precio: 3500 },
];

// La API REST real se reemplaza por un doble para que las pruebas no dependan de internet.
const httpFalso = {
  get: (url: string) => {
    const id = Number(url.split('/productos/')[1]);
    return of({ data: id ? CATALOGO.find((p) => p.id === id) : CATALOGO });
  },
};

describe('GraphQL (e2e)', () => {
  let app: INestApplication<App>;

  const consultar = (query: string) =>
    request(app.getHttpServer()).post('/graphql').send({ query }).expect(200);

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(HttpService)
      .useValue(httpFalso)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('productos devuelve los ids 1, 3 y 4', async () => {
    const res = await consultar('{ productos { id nombre precio } }');

    expect(res.body.data.productos).toEqual(CATALOGO);
  });

  it('pedir solo el nombre no devuelve id ni precio', async () => {
    const res = await consultar('{ productos { nombre } }');

    expect(res.body.data.productos[0]).toEqual({ nombre: 'Teclado mecánico' });
  });

  it('productoPorId(id: 3) devuelve el teclado inalámbrico', async () => {
    const res = await consultar('{ productoPorId(id: 3) { nombre } }');

    expect(res.body.data.productoPorId.nombre).toBe('Teclado inalámbrico hp');
  });

  it('productosBaratos filtra por precio máximo', async () => {
    const res = await consultar(
      '{ a: productosBaratos(precioMaximo: 50) { nombre } b: productosBaratos(precioMaximo: 100) { nombre } }',
    );

    expect(res.body.data.a).toHaveLength(1);
    expect(res.body.data.b).toHaveLength(2);
  });
});
