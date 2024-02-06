import React, {forwardRef} from 'react'

const BorangAduan = forwardRef((props, ref) => {
    

    return (
        <div ref={ref}>
            <p>{props.data}</p>
        </div>
    )
})

export default BorangAduan