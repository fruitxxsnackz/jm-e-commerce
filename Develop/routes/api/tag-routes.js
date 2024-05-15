const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get('/', async (req, res) => {
  try {
    const infotag = await Tag.findAll({
      include: [{ model: Product, through: ProductTag }]
    });
    res.status(200).json(infotag);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const infotag = await Tag.findByPk(req.params.id, {
      include: [{ model: Product, through: ProductTag }]
    });
    if (!infotag) {
      res.status(404).json({ message: 'No tag found' });
      return;
    }
    res.status(200).json(infotag);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post('/', async (req, res) => {
  try {
    const infotag = await Tag.create(req.body);
    res.status(201).json(infotag);
  } catch (err) {
    res.status(400).json(err);
  }
});

router.put('/:id', async (req, res) => {
  try {
    const infotag = await Tag.update(req.body, {
      where: { id: req.params.id }
    });
    if (!infotag[0]) { 
      res.status(404).json({ message: 'No tag found' });
      return;
    }
    res.status(200).json({ message: 'Updated Tags' });
  } catch (err) {
    res.status(400).json(err);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const infotag = await Tag.destroy({
      where: { id: req.params.id }
    });
    if (!infotag) {
      res.status(404).json({ message: 'No tag found' });
      return;
    }
    res.status(200).json({ message: 'Tag removed' });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
