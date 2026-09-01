const express = require('express');
const router = express.Router();
const Medication = require('../models/Medication');

router.get('/', async (req, res) => {
  try {
    const medications = await Medication.find();
    res.json(medications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, dosage, timeOfDay, time, refillCount, takenDate } = req.body;

    const newMedication = new Medication({
      name,
      dosage,
      timeOfDay: timeOfDay || time,
      refillCount: Number(refillCount) || 0,
      takenDate: takenDate || null
    });

    const savedMedication = await newMedication.save();
    res.status(201).json(savedMedication);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.patch('/:id/taken', async (req, res) => {
  try {
    const { date } = req.body;
    const medication = await Medication.findById(req.params.id);

    if (!medication) {
      return res.status(404).json({ message: 'Medication not found' });
    }

    medication.takenDate = date;
    if (medication.refillCount > 0) {
      medication.refillCount -= 1;
    }

    const updatedMedication = await medication.save();
    res.json(updatedMedication);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.patch('/:id/undo', async (req, res) => {
  try {
    const medication = await Medication.findById(req.params.id);

    if (!medication) {
      return res.status(404).json({ message: 'Medication not found' });
    }

    medication.takenDate = null;
    medication.refillCount += 1;

    const updatedMedication = await medication.save();
    res.json(updatedMedication);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Medication.findByIdAndDelete(req.params.id);
    res.json({ message: 'Medication deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;