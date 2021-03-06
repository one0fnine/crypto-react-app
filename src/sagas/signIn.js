import { select, call, put, take, fork } from 'redux-saga/effects';

import {
  createSession,
  destroySession,
  sessionSuccess,
  sessionFailure,
  selectIsAuthorizedFrom,
  newSession,
} from 'ducks/signIn';
import * as Api from 'api';
import {
  getTokenFromLocalStorage,
  setTokenToLocalStorage,
  removeTokenFromLocalStorage,
} from 'localStorage';
import requestFlow from './request';
import { fetchWalletRequest } from "ducks/wallet";
import { fetchUserTransactionsRequest } from 'ducks/transactions';
import { getUserInfoRequest } from 'ducks/user';
import { createUser } from 'ducks/signUp';

export function* authFlow() {
  while (true) {
    const isAuthorize = yield select(selectIsAuthorizedFrom);
    let token = yield call(getTokenFromLocalStorage);

    if (!isAuthorize) {
      if (token) {
        yield fork(sagaAuthorizeWithToken, token);
      } else {
        let { payload, type } = yield take([createUser, newSession]);
        if (type === createUser.toString()) continue;

        yield fork(sagaAuthorizeWithCredentials, payload);
      }

      const action = yield take([sessionSuccess, sessionFailure]);
      if (action.type === sessionSuccess.toString()) {
        yield put(createSession(action.payload));
        yield call(Api.setTokenApi, action.payload);
        yield put(fetchWalletRequest())
        yield put(fetchUserTransactionsRequest())
        yield put(getUserInfoRequest())
      } else {
        continue;
      }
    }

    yield take(destroySession);
    yield call(Api.clearTokenApi);
    yield call(removeTokenFromLocalStorage);
  }
}

function* sagaAuthorizeWithToken(payload) {
  yield put(sessionSuccess(payload));
}

function* sagaAuthorizeWithCredentials(payload) {
  try {
    const {
      data: { jwt },
    } = yield call(requestFlow, Api.login, payload);
    yield put(sessionSuccess(jwt));
    yield call(setTokenToLocalStorage, jwt);
  } catch (error) {
    yield put(sessionFailure(error));
  }
}
