import React from 'react';

export const Button = ({ children, onClick, className = '', variant = 'primary', ...props }) => {
    return (
        <button
            className={`custom-btn ${variant}-btn ${className}`}
            onClick={onClick}
            {...props}
        >
            {children}
        </button>
    );
};

export const Input = ({ icon: Icon, className = '', ...props }) => {
    return (
        <div className={`glass-input ${className}`}>
            {Icon && <Icon size={18} />}
            <input {...props} />
        </div>
    );
};

export const Modal = ({ title, subtitle, children, onClose, footer }) => {
    return (
        <div className="overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <div className="title-area">
                        <h3>{title}</h3>
                        {subtitle && <span className="subtitle">{subtitle}</span>}
                    </div>
                    <button className="close-icon-btn" onClick={onClose}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
                <div className="modal-body">
                    {children}
                </div>
                {footer && <div className="action-footer">{footer}</div>}
            </div>
        </div>
    );
};
