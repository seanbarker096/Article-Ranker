const formField = ({ meta: { error, touched }, input }) => {
  return (
    <div>
      <input {...input} style={{ marginBottom: "5px" }} />
      <div className="ui error message" style={{ marginBottom: "20px" }}>
        {touched && error}
      </div>
    </div>
  );
};

export default formField;
