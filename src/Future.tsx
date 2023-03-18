import React, { useEffect, useState } from 'react';

interface IStandardErrorPageProps {
    error: string
}

function DefaultErrorPage(props: IStandardErrorPageProps): React.ReactElement {
    return <h1>Error: {props.error.toString()}</h1>;
}

function DefaultLoadingPage(): React.ReactElement {
    return (<div>
        
    </div>);
}

interface IFutureProps {
    // this is to prevent the promise being shoot out before we want
    promise: () => Promise<any>,
    children: (data: any) => React.ReactElement,
    loading?: React.ReactElement,
    rejected?: (err: any) => React.ReactElement
}

/**
 * A React component that renders different content based on the state of a promise.
 * Displays a loading component while the promise is pending, a resolved component when
 * the promise resolves, and an error component when the promise is rejected.
 *
 * PS: the name Future comes from Dart; somehow I found TypeScript kind of similar to Dart
 */
function Future(props: IFutureProps): React.ReactElement {

    const loading = props.loading || <DefaultLoadingPage />;
    const errorPage = (error: string) =>
        props.rejected?.(error) || <DefaultErrorPage error={error} />;
    const [displayedChild, setDisplayedChild] = useState(loading);
    // to execute only once on load
    useEffect(() => {
        const obtainedPromise = props.promise()
        obtainedPromise
            .then((data) => setDisplayedChild(props.children(data)))
            .catch((err) => setDisplayedChild(errorPage(err)))
    },[]);
    console.log('call render')
    return displayedChild;
        
}

export default Future;
