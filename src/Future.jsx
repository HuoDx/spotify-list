import React from 'react';

// interface IFutureProps {
//     promise: Promise<any>,
//     children: (data: any) => React.ReactElement
//     reject: (err: any) => React.ReactElement
// }

// enum FutureState {
//     Pending,
//     Resolved,
//     Rejected
// }

function StandardErrorPage(props) {
    return <h1>Error: {props.error}</h1>
}

// spinner icons from https://github.com/n3r4zzurr0/svg-spinners, under MIT license
function Future(props) {
    const loading = props.loading || <div><img src="https://raw.githubusercontent.com/n3r4zzurr0/svg-spinners/main/svg-css/ring-resize.svg" /></div>
    const errorPage = (error) => {props.rejected ? props.rejected(error) : <StandardErrorPage error={error}/>}
    const [displayedChild, setDisplayedChild] = React.useState(loading)
    props.promise.then((data) => {
        setDisplayedChild(props.children(data))
    }).catch((err) => {
        setDisplayedChild(errorPage(err))
    })
    return (
        <div>
            {displayedChild}
        </div>
    )
}
export default Future