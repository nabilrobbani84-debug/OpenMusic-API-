// src/utils/Bcrypt.js (New File)
import bcrypt from 'bcrypt';
import InvariantError from '../exceptions/InvariantError.js';

const Bcrypt = {
  async hash(password) {
    return bcrypt.hash(password, 10);
  },
  async compare(password, hashedPassword) {
    const result = await bcrypt.compare(password, hashedPassword);
    if (!result) {
      throw new InvariantError('Kredensial yang Anda berikan salah');
    }
    return result;
  },
};

export default Bcrypt;