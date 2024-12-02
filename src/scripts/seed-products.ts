import {
  createProductsWorkflow,
  createProductCategoriesWorkflow
} from '@medusajs/medusa/core-flows';
import { ExecArgs } from '@medusajs/framework/types';
import { ContainerRegistrationKeys, Modules, ProductStatus } from '@medusajs/framework/utils';

export default async function seedAdditionalProducts({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);

  logger.info('Starting additional product seeding...');

  // Get default sales channel
  const defaultSalesChannel = await salesChannelModuleService.listSalesChannels({
    name: 'Default Sales Channel'
  });

  // Existing product categories
  const productNamePrefixes = [
    'Elegant',
    'Classic',
    'Modern',
    'Sleek',
    'Urban',
    'Vintage',
    'Premium',
    'Stylish',
    'Trendy',
    'Innovative',
    'Luxe',
    'Professional',
    'Casual',
    'Dynamic',
    'Refined'
  ];

  const generateUniqueName = () => {
    const randomPrefix =
      productNamePrefixes[Math.floor(Math.random() * productNamePrefixes.length)];
    const uniqueSuffix = `#${Date.now()}-${Math.random().toString(36).substring(7)}`;
    return `${randomPrefix} Unique Medusa Product ${uniqueSuffix}`;
  };

  // Fetch existing product count to ensure uniqueness
  const { data: existingProducts } = await query.graph({
    entity: 'product',
    fields: ['id']
  });

  const existingProductCount = existingProducts.length;

  // Fetch existing categories
  const { data: existingCategories } = await query.graph({
    entity: 'product_category',
    fields: ['id', 'name']
  });

  const generateAdditionalProducts = (
    existingProductCount,
    defaultSalesChannel,
    existingCategories
  ) => {
    const products = [];
    const categories = existingCategories.map((cat) => cat.name);
    const sizes = ['S', 'M', 'L', 'XL'];
    const colors = ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange', 'Black', 'White', 'Gray'];

    const getCategoryIdsByName = (name: string): string[] => {
      const category = existingCategories.find((cat) => cat.name === name);
      return category ? [category.id] : [];
    };

    for (let i = 0; i < 1000; i++) {
      const categoryName = categories[Math.floor(Math.random() * categories.length)];
      const selectedColors = colors.sort(() => 0.5 - Math.random()).slice(0, 2);
      const title = generateUniqueName();

      const productVariants = selectedColors.flatMap((color) =>
        sizes.map((size) => ({
          title: `${size} / ${color}`,
          sku: `UNIQUE-${existingProductCount + i + 1}-${categoryName.toUpperCase()}-${size}-${color}`,
          options: {
            Size: size,
            Color: color
          },
          prices: [
            {
              amount: Math.floor(Math.random() * 50) + 10,
              currency_code: 'eur'
            },
            {
              amount: Math.floor(Math.random() * 50) + 15,
              currency_code: 'usd'
            }
          ]
        }))
      );

      products.push({
        title: title,
        category_ids: getCategoryIdsByName(categoryName),
        description: `Unique and specially crafted ${categoryName.toLowerCase()} product with exceptional quality.`,
        handle: `unique-product-${existingProductCount + i + 1}`.toLowerCase(),
        weight: Math.floor(Math.random() * 200) + 300,
        status: ProductStatus.PUBLISHED,
        images: [
          {
            url: 'https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-black-front.png'
          }
        ],
        options: [
          {
            title: 'Size',
            values: sizes
          },
          {
            title: 'Color',
            values: selectedColors
          }
        ],
        variants: productVariants,
        sales_channels: [
          {
            id: defaultSalesChannel[0].id
          }
        ]
      });
    }

    return products;
  };

  // Generate additional products
  const additionalProducts = generateAdditionalProducts(
    existingProductCount,
    defaultSalesChannel,
    existingCategories
  );

  // Create products
  await createProductsWorkflow(container).run({
    input: {
      products: additionalProducts
    }
  });

  logger.info(`Finished seeding ${additionalProducts.length} additional unique products.`);
}
