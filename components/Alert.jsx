import React from 'react';
import PropTypes from 'prop-types';

const Alert = ({ message, type }) => {
    let alertClass;

    switch (type) {
        case 'success':
            alertClass = 'alert-success';
            break;
        case 'error':
            alertClass = 'alert-error';
            break;
        case 'warning':
            alertClass = 'alert-warning';
            break;
        case 'info':
            alertClass = 'alert-info';
            break;
        default:
            alertClass = 'alert-info';
    }

    return (
        <div className={`alert ${alertClass}`} role="alert">
            {message}
        </div>
    );
};

Alert.propTypes = {
    message: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['success', 'error', 'warning', 'info']).isRequired,
};

export default Alert;