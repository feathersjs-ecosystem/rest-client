const assert = require('assert');
const request = require('request');
const feathers = require('@feathersjs/feathers');
const baseTests = require('@feathersjs/commons/lib/test/client');
const errors = require('@feathersjs/errors');
const server = require('./server');
const rest = require('../lib/index');

describe('node-request REST connector', function () {
  const url = 'http://localhost:6777';
  const setup = rest(url).request(request);
  const app = feathers().configure(setup);
  const service = app.service('todos');

  before(function (done) {
    this.server = server().listen(6777, done);
  });

  after(function (done) {
    this.server.close(done);
  });

  baseTests(service);

  it('supports custom headers', () => {
    const headers = {
      'Authorization': 'let-me-in'
    };

    return service.get(0, { headers }).then(todo =>
      assert.deepEqual(todo, {
        id: 0,
        authorization: 'let-me-in',
        text: 'some todo',
        complete: false,
        query: {}
      })
    );
  });

  it('supports params.connection', () => {
    const connection = {
      headers: {
        'Authorization': 'let-me-in'
      }
    };

    return service.get(0, { connection }).then(todo =>
      assert.deepEqual(todo, {
        id: 0,
        authorization: 'let-me-in',
        text: 'some todo',
        complete: false,
        query: {}
      })
    );
  });

  it('can initialize a client instance', () => {
    const init = rest(url).request(request);
    const todos = init.service('todos');

    assert.ok(todos instanceof init.Service, 'Returned service is a client');

    return todos.find({}).then(todos =>
      assert.deepEqual(todos, [
        {
          text: 'some todo',
          complete: false,
          id: 0
        }
      ])
    );
  });

  it('catches connection errors', () => {
    const init = rest('nowhere').request(request);
    const todos = init.service('todos');

    return todos.find().catch(error =>
      assert.equal(error.message, 'Invalid URI "nowhere/todos"')
    );
  });

  it('supports nested arrays in queries', () => {
    const query = { test: { $in: [ 0, 1, 2 ] } };

    return service.get(0, { query }).then(data =>
      assert.deepEqual(data.query, query)
    );
  });

  it('converts errors properly', () => {
    return service.get(1, { query: { error: true } }).catch(e =>
      assert.equal(e.message, 'Something went wrong')
    );
  });

  it('remove many', () => {
    return service.remove(null).then(todo => {
      assert.equal(todo.id, null);
      assert.equal(todo.text, 'deleted many');
    });
  });

  it('converts feathers errors (#50)', () => {
    return service.get(0, { query: { feathersError: true } }).catch(error => {
      assert.ok(error instanceof errors.NotAcceptable);
      assert.equal(error.message, 'This is a Feathers error');
      assert.equal(error.code, 406);
      assert.deepEqual(error.data, { data: true });
      assert.ok(error.response);
    });
  });
});
