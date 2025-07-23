import { memo, useState, type ReactNode } from 'react';
import { Switch, Route } from 'react-router-dom';
import Spacings from '@commercetools-uikit/spacings';
import {
  buildApiUrl,
  executeHttpClientRequest,
} from '@commercetools-frontend/application-shell';
import { useAsyncDispatch, actions } from '@commercetools-frontend/sdk';

declare global {
  interface Window {
    app: {
      proxyUri: string;
    };
  }
}
type ApplicationRoutesProps = {
  children?: ReactNode;
};
const ApplicationRoutes = (_props: ApplicationRoutesProps) => {
  return (
    <Spacings.Inset scale="l">
      <Switch>
        <Route>
          <UsingExecuteHttpClientRequest />
          <UsingUseAsyncDispatch />
        </Route>
      </Switch>
    </Spacings.Inset>
  );
};
ApplicationRoutes.displayName = 'ApplicationRoutes';

export default ApplicationRoutes;

const UsingExecuteHttpClientRequest = memo(
  function UsingExecuteHttpClientRequestFN() {
    const [method, setMethod] = useState<string>('GET');
    const [path, setPath] = useState<string>('/path');
    const [body, setBody] = useState<string>('{"hello":"world"}');
    const [result, setResult] = useState<string>('');
    const fetchWithProxy = () => {
      const requestOptions = {
        method,
        ...(method === 'GET' ? {} : { body }),
      };
      return executeHttpClientRequest(
        async (options) => {
          const r = await fetch(buildApiUrl('/proxy/forward-to'), {
            ...requestOptions,
            ...options,
          });
          const data = await r.json();
          return {
            data,
            statusCode: r.status,
            getHeader: (headerName: string) => r.headers.get(headerName),
          };
        },
        {
          forwardToConfig: {
            //@ts-ignore
            uri: `${window.app.proxyUri}${path}`,
            audiencePolicy: 'forward-url-full-path',
            includeUserPermissions: true,
          },
        }
      );
    };
    return (
      <div>
        <h1>Using executeHttpClientRequest</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchWithProxy()
              .then((response) =>
                setResult(JSON.stringify(response, undefined, 2))
              )
              .catch((e) => console.log('error', e));
          }}
        >
          <select
            value={method}
            onChange={(e) => {
              setMethod(e.target.value);
            }}
          >
            <option value="GET">GET</option>
            <option value="PUT">PUT</option>
            <option value="POST">POST</option>
            <option value="PATCH">PATCH</option>
            <option value="DELETE">DELETE</option>
          </select>
          <label>
            path
            <input
              type="text"
              value={path}
              onChange={(e) => setPath(e.target.value)}
            />
          </label>
          <label>
            body
            <input
              type="text"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </label>
          <input type="submit" value="send" />
        </form>
        <pre>{result}</pre>
      </div>
    );
  }
);

//this is older way of using proxy/forward-to but @commercetools-frontend/sdk/useAsyncDispatch does not fully support the http spec
const UsingUseAsyncDispatch = memo(function UsingUseAsyncDispatchFN() {
  const [method, setMethod] = useState<string>('GET');
  const [path, setPath] = useState<string>('/path');
  const [body, setBody] = useState<string>('{"hello":"world"}');
  const [result, setResult] = useState<string>('');
  const dispatch = useAsyncDispatch();
  const fetchWithProxy = () => {
    const action =
      method === 'GET'
        ? actions.forwardTo.get
        : method === 'POST'
        ? actions.forwardTo.post
        : method === 'HEAD'
        ? actions.forwardTo.head
        : actions.forwardTo.del;
    return dispatch(
      action({
        uri: `${window.app.proxyUri}${path}`,
        payload:
          method === 'GET' || method === 'HEAD' ? undefined : JSON.parse(body),
      })
    );
  };

  return (
    <div>
      <h1>Using useAsyncDispatch</h1>
      <p>
        Using useAsyncDispatch does{' '}
        <a href="https://github.com/commercetools/merchant-center-application-kit/issues/2732#issuecomment-1205739658">
          not support
        </a>{' '}
        full HTTP spec, use executeHttpClientRequest for full support
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          fetchWithProxy()
            .then((response) =>
              setResult(JSON.stringify(response, undefined, 2))
            )
            .catch((e) => console.log('error', e));
        }}
      >
        <select
          value={method}
          onChange={(e) => {
            setMethod(e.target.value);
          }}
        >
          <option value="GET">GET</option>
          <option value="HEAD">HEAD</option>
          <option value="POST">POST</option>
          <option value="DELETE">DELETE</option>
        </select>
        <label>
          path
          <input
            type="text"
            value={path}
            onChange={(e) => setPath(e.target.value)}
          />
        </label>
        <label>
          body
          <input
            type="text"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </label>
        <input type="submit" value="send" />
      </form>
      <pre>{result}</pre>
    </div>
  );
});
