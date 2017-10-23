const assert = require('assert');
const feathers = require('@feathersjs/feathers');
const baseTests = require('feathers-commons/lib/test/client');
const errors = require('@feathersjs/errors');
const server = require('./server');
const rest = require('../lib/index');

const {
  Http,
  Headers,
  BaseRequestOptions,
  XHRBackend
} = require('@angular/http');

const xhr2 = require('xhr2');

function createAngularHTTP () {
  const XSRFStrategyShim = { configureRequest: () => {} };
  const serverXHR = { build: () => new xhr2.XMLHttpRequest() };

  return new Http(
    new XHRBackend(
      serverXHR,
      new BaseRequestOptions(),
      XSRFStrategyShim
    ),
    new BaseRequestOptions()
  );
}

describe('angular REST connector', function () {
  const angularHttp = createAngularHTTP();

  const url = 'http://localhost:8889';
  const setup = rest(url).angular(angularHttp, {Headers});
  const app = feathers().configure(setup);
  const service = app.service('todos');

  before(function (done) {
    this.server = server().listen(8889, done);
  });

  after(function (done) {
    this.server.close(done);
  });

  baseTests(service);

  it('throws an error without Headers set', () => {
    const app = feathers().configure(rest(url).angular(angularHttp));

    return app.service('dummy').find().catch(e =>
      assert.equal(e.message, `Please pass angular's 'http' (instance) and and object with 'Headers' (class) to feathers-rest`)
    );
  });

  it('supports custom headers', () => {
    let headers = {
      'Authorization': 'let-me-in'
    };

    return service.get(0, {headers}).then(todo =>
      assert.deepEqual(todo, {
        id: 0,
        text: 'some todo',
        complete: false,
        query: {}
      })
    );
  });

  it('can initialize a client instance', () => {
    const init = rest(url).angular(angularHttp, {Headers});
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

  it('supports nested arrays in queries', () => {
    const query = {test: {$in: [0, 1, 2]}};

    return service.get(0, {query}).then(data =>
      assert.deepEqual(data.query, query)
    );
  });

  it('remove many', () => {
    return service.remove(null).then(todo => {
      assert.equal(todo.id, null);
      assert.equal(todo.text, 'deleted many');
    });
  });

  it('converts feathers errors (#50)', () => {
    return service.get(0, {query: {feathersError: true}})
      .catch(error => {
        assert.ok(error instanceof errors.NotAcceptable);
        assert.equal(error.message, 'This is a Feathers error');
        assert.equal(error.code, 406);
      });
  });
});
