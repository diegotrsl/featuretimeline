import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';
//import { MessageBar, MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import * as React from 'react';
import { connect, Provider } from 'react-redux';
import { UIStatus } from '../../../Common/redux/Contracts/types';
import { getProjectId, getTeamId } from '../../../Common/redux/Selectors/CommonSelectors';
import { IEpicRoadmapState } from '../../redux/contracts';
import configureEpicRoadmapStore from '../../redux/EpicRoadmapStore';
import { uiStateSelector, outOfScopeWorkItems } from '../../redux/selectors/uiStateSelector';
import { EpicRoadmapGrid } from './EpicRoadmapGrid';
import { EpicSelector } from './EpicSelector';
import './EpicRoadmapView.scss';
import { WorkItem } from 'TFS/WorkItemTracking/Contracts';
import { launchWorkItemForm } from '../../../Common/redux/actions/launchWorkItemForm';
import { SimpleWorkItem } from '../../../Common/react/Components/WorkItem/SimpleWorkItem';

initializeIcons(/* optional base url */);

export interface IEpicRoadmapViewProps {
    projectId: string;
    teamId: string;
    uiState: UIStatus;
    outOfScopeWorkItems: WorkItem[];
    launchWorkItemForm: (id: number) => void;
}


class EpicRoadmapViewContent extends React.Component<IEpicRoadmapViewProps, {}> {
    constructor() {
        super();
    }

    public render(): JSX.Element {
        const {
            uiState,
        } = this.props;

        if (uiState === UIStatus.Loading) {
            return (
                <Spinner size={SpinnerSize.large} label="Loading..." />
            );
        }

        if (uiState === UIStatus.NoTeamIterations) {
            return (
                <MessageBar
                    messageBarType={MessageBarType.error}
                    isMultiline={false}
                >
                    {"The team does not have any iteration selected, please visit team admin page and select team iterations."}
                </MessageBar>
            );
        }

        if (uiState === UIStatus.NoWorkItems) {
            return (<MessageBar
                messageBarType={MessageBarType.info}
                isMultiline={false}
            >
                {"No in-progress Features for the timeline."}
            </MessageBar>);
        }

        if (uiState === UIStatus.OutofScopeTeamIterations) {

            return (
                <MessageBar
                    messageBarType={MessageBarType.severeWarning}
                    isMultiline={true}
                >
                    <div>{"Following Work Items are in iterations that the current team does not subscribe to."}</div>
                    <div>
                        {
                            this.props.outOfScopeWorkItems.map(w =>
                                <SimpleWorkItem
                                    workItem={w}
                                    onShowWorkItem={this.props.launchWorkItemForm}
                                />
                            )
                        }
                    </div>
                </MessageBar>
            );
        }

        return (
            <div className="epic-container">
                <EpicSelector
                    projectId={this.props.projectId}
                    teamId={this.props.teamId} />
                <EpicRoadmapGrid />
            </div>
        );
    }
}


const makeMapStateToProps = () => {
    return (state: IEpicRoadmapState) => {
        return {
            projectId: getProjectId(),
            teamId: getTeamId(),
            uiState: uiStateSelector(state),
            outOfScopeWorkItems: outOfScopeWorkItems(state)
        }
    }
}

const mapDispatchToProps = () => {
    return (dispatch) => {
        return {
            launchWorkItemForm: (id) => {
                if (id) {
                    dispatch(launchWorkItemForm(id));
                }
            }
        }
    }
}
export const ConnectedEpicRoadmapViewContent = connect(makeMapStateToProps, mapDispatchToProps)(EpicRoadmapViewContent);

export const EpicRoadmapView = () => {
    const initialState: IEpicRoadmapState = {
    } as IEpicRoadmapState;
    const store = configureEpicRoadmapStore(initialState);

    return (
        <Provider store={store}>
            <ConnectedEpicRoadmapViewContent />
        </Provider>);
}


