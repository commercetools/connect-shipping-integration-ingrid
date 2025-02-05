import client from "../coco/index";

import { Project } from "@commercetools/platform-sdk";
import Store from "./Store";

type Action = { type: "SET_PROJECT"; project: Project };

const initialState = undefined;

const cocoProjectSettingsStore = new Store<Project | undefined, Action>(
  (action, _state, setState) => {
    if (action.type === "SET_PROJECT") {
      setState(action.project);
    }
  },
  initialState
);

client
  .get()
  .execute()
  .then((result) => {
    cocoProjectSettingsStore.dispatch({
      type: "SET_PROJECT",
      project: result.body,
    });
  });

export default cocoProjectSettingsStore;
