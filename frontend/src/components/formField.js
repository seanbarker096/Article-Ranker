const formField = ({ meta: { error, touched }, input, type }) => {
    return (
        <div>
            <input {...input} type={type} style={{ marginBottom: '5px' }} />
            <div className="ui error message" style={{ marginBottom: '20px' }}>
                {touched && error}
            </div>
        </div>
    );
};

export default formField;
