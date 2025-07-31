import request from 'supertest';
import { app } from './index';
import { messages } from './chats/chats.models';

describe('Chat API', () => {
  beforeEach(() => {
    messages.length = 0; // Reset in-memory messages before each test
  });

  it('should get all messages (empty at start)', async () => {
    const res = await request(app).get('/api/chat/messages');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('should post a new message', async () => {
    const message = { sender: 'John Doe', text: 'Hello, world!' };
    const res = await request(app).post('/api/chat/send').send(message);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.sender).toBe(message.sender);
    expect(res.body.text).toBe(message.text);
    expect(res.body).toHaveProperty('timestamp');
  });

  it('should get the posted message', async () => {
    const message = { sender: 'Jane', text: 'Hi!' };
    await request(app).post('/api/chat/send').send(message);

    const res = await request(app).get('/api/chat/messages');
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].sender).toBe('Jane');
    expect(res.body[0].text).toBe('Hi!');
  });

  it('should return 400 for invalid message', async () => {
    const res = await request(app).post('/api/chat/send').send({ sender: '' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Sender and text are required.');
  });
});
