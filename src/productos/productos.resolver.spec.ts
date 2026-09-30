import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { ProductosResolver } from './productos.resolver';

const CATALOGO = [
  { id: 1, nombre: 'Teclado mecánico', precio: 45.9 },
  { id: 3, nombre: 'Teclado inalámbrico hp', precio: 75.5 },
  { id: 4, nombre: 'MacBook Pro', precio: 3500 },
];

describe('ProductosResolver', () => {
  let resolver: ProductosResolver;
  const http = { get: jest.fn() };

  beforeEach(async () => {
    http.get.mockReset();
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductosResolver, { provide: HttpService, useValue: http }],
    }).compile();

    resolver = module.get<ProductosResolver>(ProductosResolver);
  });

  it('productos devuelve el catálogo completo de la API', async () => {
    http.get.mockReturnValue(of({ data: CATALOGO }));

    await expect(resolver.productos()).resolves.toEqual(CATALOGO);
    expect(http.get).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/v1\/productos$/),
    );
  });

  it('productoPorId pide el producto por su id', async () => {
    http.get.mockReturnValue(of({ data: CATALOGO[1] }));

    await expect(resolver.productoPorId(3)).resolves.toEqual(CATALOGO[1]);
    expect(http.get).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/v1\/productos\/3$/),
    );
  });

  it('productosBaratos(50) devuelve 1 producto', async () => {
    http.get.mockReturnValue(of({ data: CATALOGO }));

    await expect(resolver.productosBaratos(50)).resolves.toEqual([CATALOGO[0]]);
  });

  it('productosBaratos(100) devuelve 2 productos', async () => {
    http.get.mockReturnValue(of({ data: CATALOGO }));

    await expect(resolver.productosBaratos(100)).resolves.toHaveLength(2);
  });
});
