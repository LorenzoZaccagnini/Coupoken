import React from "react";

const code = {
  name: "A name",
  description: "An amazing description",
  image: "https://domain.com/image"
};

const style = {
  backgroundColor: "#1f4662",
  color: "#fff",
  fontSize: "14px"
};

const headerStyle = {
  backgroundColor: "#193549",
  padding: "5px 10px",
  fontFamily: "monospace",
  color: "#ffc600"
};

const preStyle = {
  display: "block",
  padding: "10px 30px",
  margin: "0",
};

const UriBlock = () => (
  <div style={style}>
    <div style={headerStyle}>
      <strong>URI structure example</strong>
    </div>
    <pre style={preStyle}>{JSON.stringify(code, null, 2)}</pre>
  </div>
);

export default UriBlock;
