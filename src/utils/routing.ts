import { useParams } from "react-router";

/** The `:id` segment of the current route. Only for pages whose routes declare `:id`. */
export const useIdParam = (): string => {
  const { id } = useParams();
  if (id === undefined) throw new Error("This page is only routed with an :id segment");
  return id;
};
