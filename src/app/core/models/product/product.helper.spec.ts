import * as using from 'jasmine-data-provider';

import { AttributeGroup } from 'ish-core/models/attribute-group/attribute-group.model';
import { AttributeGroupTypes } from 'ish-core/models/attribute-group/attribute-group.types';

import { ProductDataStub } from './product.interface';
import { Product, ProductHelper } from './product.model';
import { ProductType } from './product.types';

describe('Product Helper', () => {
  describe('generateProductRoute()', () => {
    function dataProvider() {
      return [
        {
          product: { sku: 'SKU' },
          category: { uniqueId: 'CAT' },
          expected: '/category/CAT/product/SKU',
        },
        { product: { sku: 'SKU' }, category: undefined, expected: '/product/SKU' },
        { product: {}, category: undefined, expected: '/' },
        { product: undefined, category: undefined, expected: '/' },
        {
          product: { sku: 'SKU', name: 'name' },
          category: { uniqueId: 'CAT' },
          expected: '/category/CAT/product/SKU/name',
        },
        { product: { sku: 'SKU', name: 'name' }, category: undefined, expected: '/product/SKU/name' },
      ];
    }

    using(dataProvider, dataSlice => {
      it(`should return ${dataSlice.expected} when supplying product '${JSON.stringify(
        dataSlice.product
      )}' and category '${JSON.stringify(dataSlice.category)}'`, () => {
        expect(ProductHelper.generateProductRoute(dataSlice.product, dataSlice.category)).toEqual(dataSlice.expected);
      });
    });
  });

  describe('generateProductSlug()', () => {
    using(
      [
        { product: { sku: 'A' }, expected: undefined },
        { product: { sku: 'A', name: '' }, expected: undefined },
        { product: { sku: 'A', name: 'some example name' }, expected: 'some-example-name' },
        { product: { sku: 'A', name: 'name & speci@l char$' }, expected: 'name-speci-l-char' },
      ],
      dataSlice => {
        it(`should return ${dataSlice.expected} when supplying product '${JSON.stringify(dataSlice.product)}'`, () => {
          expect(ProductHelper.generateProductSlug(dataSlice.product)).toEqual(dataSlice.expected);
        });
      }
    );
  });

  describe('image', () => {
    let product: Product;
    beforeEach(() => {
      product = { sku: 'sku' } as Product;
      product.images = [
        {
          name: 'front S',
          type: 'Image',
          imageActualHeight: 110,
          imageActualWidth: 110,
          viewID: 'front',
          effectiveUrl: '/assets/product_img/a.jpg',
          typeID: 'S',
          primaryImage: true,
        },
        {
          name: 'front S',
          type: 'Image',
          imageActualHeight: 110,
          imageActualWidth: 110,
          viewID: 'front',
          effectiveUrl: '/assets/product_img/a.jpg',
          typeID: 'S',
          primaryImage: false,
        },
        {
          name: 'front L',
          type: 'Image',
          imageActualHeight: 500,
          imageActualWidth: 500,
          viewID: 'front',
          effectiveUrl: '/assets/product_img/a.jpg',
          typeID: 'L',
          primaryImage: true,
        },
        {
          name: 'side L',
          type: 'Image',
          imageActualHeight: 500,
          imageActualWidth: 500,
          viewID: 'side',
          effectiveUrl: '/assets/product_img/a.jpg',
          typeID: 'L',
          primaryImage: false,
        },
      ];
    });

    describe('getPrimaryImage()', () => {
      it('should return primary image when called with image type as L(Large size)', () => {
        expect(ProductHelper.getPrimaryImage(product, 'L').primaryImage).toBeTruthy();
      });

      it('should return undefined  when called with invalid image type', () => {
        expect(ProductHelper.getPrimaryImage(product, 'W')).toBeUndefined();
      });

      it('should return undefined when images are not available', () => {
        product.images = [];
        expect(ProductHelper.getPrimaryImage(product, 'L')).toBeUndefined();
      });

      it('should return undefined when images is not defined', () => {
        product = { sku: 'sku' } as Product;
        expect(ProductHelper.getPrimaryImage(product, 'L')).toBeUndefined();
      });
    });

    describe('getImageByImageTypeAndImageView()', () => {
      it('should return image when called with image type as L(Large size) and image view as front', () => {
        expect(ProductHelper.getImageByImageTypeAndImageView(product, 'L', 'front')).toEqual(product.images[2]);
      });

      it('should return undefined when called with invalid image type and invalid image view', () => {
        expect(ProductHelper.getImageByImageTypeAndImageView(product, 'W', 'left')).toBeUndefined();
      });

      it('should return undefined when images are not available', () => {
        product.images = [];
        expect(ProductHelper.getImageByImageTypeAndImageView(product, 'L', 'front')).toBeUndefined();
      });

      it('should return undefined when images is not defined', () => {
        product = { sku: 'sku' } as Product;
        expect(ProductHelper.getImageByImageTypeAndImageView(product, 'L', 'front')).toBeUndefined();
      });
    });

    describe('getImageViewIDsExcludePrimary()', () => {
      it('should return list of image viewIDs  excluding primary image viewID when called with image type as L(Large size)', () => {
        expect(ProductHelper.getImageViewIDsExcludePrimary(product, 'L').length).toBeGreaterThan(0);
      });

      it('should return empty list when called with invalid image type', () => {
        expect(ProductHelper.getImageViewIDsExcludePrimary(product, 'W')).toBeEmpty();
      });

      it('should return empty list when images are not available', () => {
        product.images = [];
        expect(ProductHelper.getImageViewIDsExcludePrimary(product, 'L')).toBeEmpty();
      });

      it('should return empty list when images is not defined', () => {
        product = { sku: 'sku' } as Product;
        expect(ProductHelper.getImageViewIDsExcludePrimary(product, 'L')).toBeEmpty();
      });
    });
  });

  describe('isMasterProduct()', () => {
    function dataProvider() {
      return [
        { product: { type: ProductType.Product }, expected: false },
        { product: { type: ProductType.VariationProduct }, expected: false },
        { product: { type: ProductType.VariationProductMaster }, expected: true },
      ];
    }

    using(dataProvider, dataSlice => {
      it(`should return ${dataSlice.expected} when supplying product '${JSON.stringify(dataSlice.product)}'`, () => {
        expect(ProductHelper.isMasterProduct(dataSlice.product)).toEqual(dataSlice.expected);
      });
    });
  });

  describe('get attributes', () => {
    it('should return attribute when attribute is defined', () => {
      const productData = {
        attributes: [{ name: 'sku', type: 'string', value: '01234567' }],
        description: '',
      } as ProductDataStub;
      expect(ProductHelper.getAttributeByAttributeName(productData, 'sku').value).toBe('01234567');
    });

    it('should return attribute of attribute group when attribute group is defined', () => {
      const attributeGroup = {
        attributes: [{ name: 'sale', type: 'string', value: 'sale' }],
      } as AttributeGroup;
      const product = {
        name: 'FakeProduct',
        sku: 'sku',
        attributeGroups: {
          [AttributeGroupTypes.ProductLabelAttributes]: attributeGroup,
        } as { [id: string]: AttributeGroup },
      } as Product;
      const attributes = ProductHelper.getAttributesOfGroup(product, AttributeGroupTypes.ProductLabelAttributes);
      expect(attributes).not.toBeEmpty();
      expect(attributes[0].name).toBe('sale');
    });
  });
});