const express = require('express');
const device = require('device');

const router = express.Router();

const adType = 1; // 1 = coinzilla, 2 = bitmedia

router.get('/', (req, res, next) => {
  const mydevice = device(req.get('User-Agent'));
  res.render('home', {
    title: 'CryptoBlades Tracker',
    page: 'home',
    isPhone: mydevice.is('phone'),
    adType,
  });
});
router.get('/calculator', (req, res, next) => {
  const mydevice = device(req.get('User-Agent'));
  res.render('calculator', {
    title: 'CryptoBlades Tracker - Rewards Calculator',
    page: 'calculator',
    isPhone: mydevice.is('phone'),
    adType,
  });
});
// router.get('/stats', (req, res, next) => res.render('stats', { title: 'CryptoBlades Tracker - Statistics', page: 'stats' }));
router.get('/diagnostic', (req, res, next) => {
  const mydevice = device(req.get('User-Agent'));
  res.render('diagnostic', {
    title: 'Tools - Diagnostic',
    page: 'diagnostic',
    isPhone: mydevice.is('phone'),
    adType,
  });
});
router.get('/market', (req, res, next) => {
  const mydevice = device(req.get('User-Agent'));
  res.render('market', {
    title: 'Tools - Market Sales Tracker',
    page: 'market',
    isPhone: mydevice.is('phone'),
    adType,
  });
});

module.exports = router;
