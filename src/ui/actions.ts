import * as _ from "lodash";

export interface Action {
  id: string;
  name: string;
  disable?: boolean;
  callback: () => void;
}

export const view_actions = (
  parent: HTMLDivElement,
  actions: (Action | Action[])[]
) => {
  const actionsElm = _getActions(actions);
  parent.append(actionsElm);
};

const _getActions = (actions: (Action | Action[])[]): HTMLDivElement => {
  const actionsElm = document.createElement("div");
  actionsElm.classList.add(...["actions-container"]);

  _.forEach(actions, (actionOrRowActions) => {
    let rowActions = [];
    if (_.isArray(actionOrRowActions)) {
      rowActions = actionOrRowActions;
    } else {
      rowActions = [actionOrRowActions];
    }

    const actionsRaw = document.createElement("div");
    actionsRaw.classList.add(...["actions-row"]);

    _.each(rowActions, (action) => {
      if (!action.disable) {
        const button = document.createElement("button");
        button.append(document.createTextNode(action.name));
        button.setAttribute("id", action.id);
        button.addEventListener("click", action.callback);
        actionsRaw.append(button);
      }
    });

    actionsElm.append(actionsRaw);
  });

  return actionsElm;
};
