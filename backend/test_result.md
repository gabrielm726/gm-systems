============================= test session starts =============================
platform win32 -- Python 3.14.2, pytest-9.0.2, pluggy-1.6.0
rootdir: C:\Users\user\Desktop\Sistema G.T Gestão Patrimonial\backend
plugins: anyio-4.12.1
collected 2 items

tests\test_main.py F.                                                    [100%]

================================== FAILURES ===================================
______________________________ test_create_user _______________________________

    def test_create_user():
        # Limpa tabela antes (opcional para testes simples, ou recria banco)
        # Base.metadata.drop_all(bind=engine)
        # Base.metadata.create_all(bind=engine)
    
>       response = client.post("/users/", json={"username": "testuser", "password": "testpass"})
                   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

tests\test_main.py:40: 
_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
venv\Lib\site-packages\starlette\testclient.py:546: in post
    return super().post(
venv\Lib\site-packages\httpx\_client.py:1144: in post
    return self.request(
venv\Lib\site-packages\starlette\testclient.py:445: in request
    return super().request(
venv\Lib\site-packages\httpx\_client.py:825: in request
    return self.send(request, auth=auth, follow_redirects=follow_redirects)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
venv\Lib\site-packages\httpx\_client.py:914: in send
    response = self._send_handling_auth(
venv\Lib\site-packages\httpx\_client.py:942: in _send_handling_auth
    response = self._send_handling_redirects(
venv\Lib\site-packages\httpx\_client.py:979: in _send_handling_redirects
    response = self._send_single_request(request)
               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
venv\Lib\site-packages\httpx\_client.py:1014: in _send_single_request
    response = transport.handle_request(request)
               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
venv\Lib\site-packages\starlette\testclient.py:348: in handle_request
    raise exc
venv\Lib\site-packages\starlette\testclient.py:345: in handle_request
    portal.call(self.app, scope, receive, send)
venv\Lib\site-packages\anyio\from_thread.py:334: in call
    return cast(T_Retval, self.start_task_soon(func, *args).result())
                          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
..\..\..\AppData\Local\Programs\Python\Python314\Lib\concurrent\futures\_base.py:450: in result
    return self.__get_result()
           ^^^^^^^^^^^^^^^^^^^
..\..\..\AppData\Local\Programs\Python\Python314\Lib\concurrent\futures\_base.py:395: in __get_result
    raise self._exception
venv\Lib\site-packages\anyio\from_thread.py:259: in _call_func
    retval = await retval_or_awaitable
             ^^^^^^^^^^^^^^^^^^^^^^^^^
venv\Lib\site-packages\fastapi\applications.py:1135: in __call__
    await super().__call__(scope, receive, send)
venv\Lib\site-packages\starlette\applications.py:107: in __call__
    await self.middleware_stack(scope, receive, send)
venv\Lib\site-packages\starlette\middleware\errors.py:186: in __call__
    raise exc
venv\Lib\site-packages\starlette\middleware\errors.py:164: in __call__
    await self.app(scope, receive, _send)
venv\Lib\site-packages\starlette\middleware\exceptions.py:63: in __call__
    await wrap_app_handling_exceptions(self.app, conn)(scope, receive, send)
venv\Lib\site-packages\starlette\_exception_handler.py:53: in wrapped_app
    raise exc
venv\Lib\site-packages\starlette\_exception_handler.py:42: in wrapped_app
    await app(scope, receive, sender)
venv\Lib\site-packages\fastapi\middleware\asyncexitstack.py:18: in __call__
    await self.app(scope, receive, send)
venv\Lib\site-packages\starlette\routing.py:716: in __call__
    await self.middleware_stack(scope, receive, send)
venv\Lib\site-packages\starlette\routing.py:736: in app
    await route.handle(scope, receive, send)
venv\Lib\site-packages\starlette\routing.py:290: in handle
    await self.app(scope, receive, send)
venv\Lib\site-packages\fastapi\routing.py:115: in app
    await wrap_app_handling_exceptions(app, request)(scope, receive, send)
venv\Lib\site-packages\starlette\_exception_handler.py:53: in wrapped_app
    raise exc
venv\Lib\site-packages\starlette\_exception_handler.py:42: in wrapped_app
    await app(scope, receive, sender)
venv\Lib\site-packages\fastapi\routing.py:101: in app
    response = await f(request)
               ^^^^^^^^^^^^^^^^
venv\Lib\site-packages\fastapi\routing.py:355: in app
    raw_response = await run_endpoint_function(
venv\Lib\site-packages\fastapi\routing.py:245: in run_endpoint_function
    return await run_in_threadpool(dependant.call, **values)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
venv\Lib\site-packages\starlette\concurrency.py:32: in run_in_threadpool
    return await anyio.to_thread.run_sync(func)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
venv\Lib\site-packages\anyio\to_thread.py:63: in run_sync
    return await get_async_backend().run_sync_in_worker_thread(
venv\Lib\site-packages\anyio\_backends\_asyncio.py:2502: in run_sync_in_worker_thread
    return await future
           ^^^^^^^^^^^^
venv\Lib\site-packages\anyio\_backends\_asyncio.py:986: in run
    result = context.run(func, *args)
             ^^^^^^^^^^^^^^^^^^^^^^^^
main.py:19: in create_user
    hashed_password = auth.get_password_hash(user.password)
                      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
app\auth.py:28: in get_password_hash
    return pwd_context.hash(password)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^
venv\Lib\site-packages\passlib\context.py:2258: in hash
    return record.hash(secret, **kwds)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^
venv\Lib\site-packages\passlib\utils\handlers.py:779: in hash
    self.checksum = self._calc_checksum(secret)
                    ^^^^^^^^^^^^^^^^^^^^^^^^^^^
venv\Lib\site-packages\passlib\handlers\bcrypt.py:591: in _calc_checksum
    self._stub_requires_backend()
venv\Lib\site-packages\passlib\utils\handlers.py:2254: in _stub_requires_backend
    cls.set_backend()
venv\Lib\site-packages\passlib\utils\handlers.py:2156: in set_backend
    return owner.set_backend(name, dryrun=dryrun)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
venv\Lib\site-packages\passlib\utils\handlers.py:2163: in set_backend
    return cls.set_backend(name, dryrun=dryrun)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
venv\Lib\site-packages\passlib\utils\handlers.py:2188: in set_backend
    cls._set_backend(name, dryrun)
venv\Lib\site-packages\passlib\utils\handlers.py:2311: in _set_backend
    super(SubclassBackendMixin, cls)._set_backend(name, dryrun)
venv\Lib\site-packages\passlib\utils\handlers.py:2224: in _set_backend
    ok = loader(**kwds)
         ^^^^^^^^^^^^^^
venv\Lib\site-packages\passlib\handlers\bcrypt.py:626: in _load_backend_mixin
    return mixin_cls._finalize_backend_mixin(name, dryrun)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
venv\Lib\site-packages\passlib\handlers\bcrypt.py:421: in _finalize_backend_mixin
    if detect_wrap_bug(IDENT_2A):
       ^^^^^^^^^^^^^^^^^^^^^^^^^
venv\Lib\site-packages\passlib\handlers\bcrypt.py:380: in detect_wrap_bug
    if verify(secret, bug_hash):
       ^^^^^^^^^^^^^^^^^^^^^^^^
venv\Lib\site-packages\passlib\utils\handlers.py:792: in verify
    return consteq(self._calc_checksum(secret), chk)
                   ^^^^^^^^^^^^^^^^^^^^^^^^^^^
_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _

self = <passlib.handlers.bcrypt._BcryptBackend object at 0x000001CADACC5350>
secret = b'01234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345...7890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234'

    def _calc_checksum(self, secret):
        # bcrypt behavior:
        #   secret must be bytes
        #   config must be ascii bytes
        #   returns ascii bytes
        secret, ident = self._prepare_digest_args(secret)
        config = self._get_config(ident)
        if isinstance(config, unicode):
            config = config.encode("ascii")
>       hash = _bcrypt.hashpw(secret, config)
               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
E       ValueError: password cannot be longer than 72 bytes, truncate manually if necessary (e.g. my_password[:72])

venv\Lib\site-packages\passlib\handlers\bcrypt.py:655: ValueError
------------------------------ Captured log call ------------------------------
WARNING  passlib.handlers.bcrypt:bcrypt.py:622 (trapped) error reading bcrypt version
Traceback (most recent call last):
  File "C:\Users\user\Desktop\Sistema G.T Gestão Patrimonial\backend\venv\Lib\site-packages\passlib\handlers\bcrypt.py", line 620, in _load_backend_mixin
    version = _bcrypt.__about__.__version__
              ^^^^^^^^^^^^^^^^^
AttributeError: module 'bcrypt' has no attribute '__about__'
============================== warnings summary ===============================
app\database.py:11
  C:\Users\user\Desktop\Sistema G.T Gestão Patrimonial\backend\app\database.py:11: MovedIn20Warning: The ``declarative_base()`` function is now available as sqlalchemy.orm.declarative_base(). (deprecated since: 2.0) (Background on SQLAlchemy 2.0 at: https://sqlalche.me/e/b8d9)
    Base = declarative_base()

-- Docs: https://docs.pytest.org/en/stable/how-to/capture-warnings.html
=========================== short test summary info ===========================
FAILED tests/test_main.py::test_create_user - ValueError: password cannot be ...
=================== 1 failed, 1 passed, 1 warning in 1.67s ====================
