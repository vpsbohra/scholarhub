const Student = require('../models/Student');

exports.getMe = async (req, res, next) => {
  try {
    const me = await Student.findByPk(req.user.sub, { raw: true });
    if (!me) throw new Error('Student not found');
    res.json(me);
  } catch (e) { next(e); }
};

exports.updateMe = async (req, res, next) => {
  try {
    const allowed = [
      'first_name','last_name','email','phone_number','dob','gender',
      'guardian_name','annual_income','category','aadhar_number',
      'address','city','state','pincode',
      'bank_account_no','ifsc_code'
    ];
    const patch = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
    await Student.update(patch, { where: { student_id: req.user.sub } });
    const me = await Student.findByPk(req.user.sub, { raw: true });
    res.json(me);
  } catch (e) { next(e); }
};
