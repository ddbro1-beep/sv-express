import express from 'express';
import {
  getCountries,
  getOriginCountries,
  getDestinationCountries,
} from '../controllers/country.controller';

const router = express.Router();

// Public routes
router.get('/', getCountries);
router.get('/origins', getOriginCountries);
router.get('/destinations', getDestinationCountries);

export default router;
