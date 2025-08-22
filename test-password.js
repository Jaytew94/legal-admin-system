const bcrypt = require('bcryptjs');

const password = 'admin123';
const hash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';

console.log('Testing password:', password);
console.log('Testing hash:', hash);

const isValid = bcrypt.compareSync(password, hash);
console.log('Password valid:', isValid);

// Generate new hash
const newHash = bcrypt.hashSync(password, 10);
console.log('New hash:', newHash);
