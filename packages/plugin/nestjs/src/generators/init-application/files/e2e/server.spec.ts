import axios from 'axios';

describe('GET /info', () => {
  it('should return the application info', async () => {
    const res = await axios.get(`/info`);

    expect(res.status).toBe(200);

    expect(res.data).toHaveProperty('app');
    expect(res.data).toHaveProperty('name');
    expect(res.data).toHaveProperty('production');
  });
});
