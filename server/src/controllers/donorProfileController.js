const CsrDonor = require('../models/CsrDonor');

exports.getMe = async (req, res, next) => {
  try {
    const me = await CsrDonor.findByPk(req.user.sub, { raw: true });
    if (!me) throw new Error('Donor not found');
    res.json(me);
  } catch (e) { next(e); }
};

exports.updateMe = async (req, res, next) => {
  try {
    const allowed = [
      'organization_name','contact_person','email','phone_number',
      'address','city','state','pincode'
    ];
    const patch = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
    await CsrDonor.update(patch, { where: { donor_id: req.user.sub } });
    const me = await CsrDonor.findByPk(req.user.sub, { raw: true });
    res.json(me);
  } catch (e) { next(e); }
};
