import * as _ from "lodash";

export interface Action {
  id: string;
  name: string;
  disable?: boolean;
  callback: () => void;
}

export const view_actions = (parent: HTMLDivElement, actions: Action[]) => {
  const actionsElm = _getActions(actions);
  parent.append(actionsElm);
};

const _getActions = (actions: Action[]): HTMLDivElement => {
  const actionsElm = document.createElement("div");
  actionsElm.classList.add(...["actions-container"]);

  _.forEach(actions, (action) => {
    if (!action.disable) {
      const button = document.createElement("button");
      button.append(document.createTextNode(action.name));
      button.setAttribute("id", action.id);
      button.addEventListener("click", action.callback);
      actionsElm.append(button);
    }
  });

  return actionsElm;
};
