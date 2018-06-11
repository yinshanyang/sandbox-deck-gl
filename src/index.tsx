import * as React from "react";

export type Props = {
  children?: React.ReactElement<any>[] | React.ReactElement<any>;
  data: {
    id?: string;
    value?: string;
  };
};

const Component = ({
  children,
  data = {
    id: null,
    value: null
  }
}: Props) => (
  <div className="f6 pv2 ph2">
    <h3 className="serif f4">
      {data.id}: {data.value}
    </h3>
    {children}
  </div>
);

export default Component;
