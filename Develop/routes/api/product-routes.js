const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', async (req, res) => {
  try {
    const productData = await Product.findAll({
      include: [{ model: Category }, { model: Tag, through: ProductTag }],
    });
    res.status(200).json(productData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// get one product
router.get('/:id', async (req, res) => {
  try {
    const productData = await Product.findByPk(req.params.id, {
      include: [{ model: Category }, { model: Tag, through: ProductTag }],
    });
    if (!productData) {
      res.status(404).json({ message: 'No product found with this id!' });
      return;
    }
    res.status(200).json(productData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// create new product
router.post('/', (req, res) => {
  /* req.body should look like this...
    {
      product_name: "Basketball",
      price: 200.00,
      stock: 3,
      tagIds: [1, 2, 3, 4]
    }
  */
  Product.create(req.body)
    .then((product) => {
      // if there's product tags, we need to create pairings to bulk create in the ProductTag model
      if (req.body.tagIds.length) {
        const productTagIdArr = req.body.tagIds.map((tag_id) => {
          return {
            product_id: product.id,
            tag_id,
          };
        });
        return ProductTag.bulkCreate(productTagIdArr);
      }
      // if no product tags, just respond
      res.status(200).json(product);
    })
    .then((producttagid) => res.status(200).json(producttagid))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

// update product
router.put('/:id', async (req, res) => {
  try {
    await Product.update(req.body, {
      where: { id: req.params.id },
    });

    const producttags = await ProductTag.findAll({ where: { product_id: req.params.id } });
    const producttagid = producttags.map(tag => tag.tag_id);
    const addproducttags = req.body.tagIds
      .filter(tag_id => !producttagid.includes(tag_id))
      .map(tag_id => {
        return { product_id: req.params.id, tag_id };
      });

    const deleteproducttag = producttags
      .filter(tag => !req.body.tagIds.includes(tag.tag_id))
      .map(tag => tag.id);

    await Promise.all([
      ProductTag.destroy({ where: { id: deleteproducttag } }),
      ProductTag.bulkCreate(addproducttags),
    ]);

    res.status(200).json({ message: 'Products adjusted' });
  } catch (err) {
    res.status(400).json(err);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deletion = await Product.destroy({
      where: { id: req.params.id },
    });
    if (!deletion) {
      res.status(404).json({ message: 'No product found' });
      return;
    }
    res.status(200).json({ message: 'Product removed' });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
