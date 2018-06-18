import * as React from "react";
export declare type Props = {
    children?: React.ReactElement<any>[] | React.ReactElement<any>;
    data: {
        id?: string;
        value?: string;
    };
};
declare const Component: ({ children, data }: Props) => JSX.Element;
export default Component;
