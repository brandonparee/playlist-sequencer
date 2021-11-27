//github.com/vercel/next.js/issues/15913#issuecomment-912445809

https: type GetSSRResult<TProps> =
  | { props: TProps }
  | { redirect: any }
  | { notFound: boolean };

type GetSSRFn<TProps extends any> = (
  args: any
) => Promise<GetSSRResult<TProps>>;

export type inferSSRProps<TFn extends GetSSRFn<any>> = TFn extends GetSSRFn<
  infer TProps
>
  ? NonNullable<TProps>
  : never;
