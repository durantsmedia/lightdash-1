import { Button, Classes, Divider, Intent, Menu } from '@blueprintjs/core';
import { MenuItem2, Popover2, Tooltip2 } from '@blueprintjs/popover2';
import { Dashboard, SpaceSummary, UpdatedByUser } from '@lightdash/common';
import { Box, Tooltip } from '@mantine/core';
import {
    IconCheck,
    IconCopy,
    IconDots,
    IconFolders,
    IconPencil,
    IconPlus,
    IconSend,
    IconTrash,
    IconUpload,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { useToggle } from 'react-use';
import { useApp } from '../../../providers/AppProvider';
import { useTracking } from '../../../providers/TrackingProvider';
import { EventName } from '../../../types/Events';
import AddTileButton from '../../DashboardTiles/AddTileButton';
import DashboardSchedulersModal from '../../SchedulerModals/DashboardSchedulersModal';
import { getSchedulerUuidFromUrlParams } from '../../SchedulerModals/SchedulerModalBase/SchedulerModalContent';
import ShareLinkButton from '../../ShareLinkButton';
import DashboardUpdateModal from '../modal/DashboardUpdateModal';
import PageHeader from '../Page/PageHeader';
import {
    PageActionsContainer,
    PageDetailsContainer,
    PageTitle,
    PageTitleAndDetailsContainer,
    PageTitleContainer,
    SeparatorDot,
} from '../PageHeader';
import SpaceAndDashboardInfo from '../PageHeader/SpaceAndDashboardInfo';
import { UpdatedInfo } from '../PageHeader/UpdatedInfo';
import ViewInfo from '../PageHeader/ViewInfo';
import SpaceActionModal, { ActionType } from '../SpaceActionModal';

type DashboardHeaderProps = {
    spaces?: SpaceSummary[];
    dashboardDescription?: string;
    dashboardName: string;
    dashboardSpaceName?: string;
    dashboardSpaceUuid?: string;
    dashboardUpdatedAt: Date;
    dashboardViews: number;
    dashboardFirstViewedAt: Date | string | null;
    dashboardUpdatedByUser?: UpdatedByUser;
    hasDashboardChanged: boolean;
    isEditMode: boolean;
    isSaving: boolean;
    onAddTiles: (tiles: Dashboard['tiles'][number][]) => void;
    onCancel: () => void;
    onSaveDashboard: () => void;
    onDelete: () => void;
    onDuplicate: () => void;
    onMoveToSpace: (spaceUuid: string) => void;
    onExport: () => void;
};

const DashboardHeader = ({
    spaces = [],
    dashboardDescription,
    dashboardName,
    dashboardSpaceName,
    dashboardSpaceUuid,
    dashboardViews,
    dashboardFirstViewedAt,
    dashboardUpdatedAt,
    dashboardUpdatedByUser,
    hasDashboardChanged,
    isEditMode,
    isSaving,
    onAddTiles,
    onCancel,
    onSaveDashboard,
    onDelete,
    onDuplicate,
    onMoveToSpace,
    onExport,
}: DashboardHeaderProps) => {
    const { search } = useLocation();
    const { projectUuid, dashboardUuid } = useParams<{
        projectUuid: string;
        dashboardUuid: string;
    }>();
    const history = useHistory();
    const { track } = useTracking();
    const [isUpdating, setIsUpdating] = useState(false);
    const [isCreatingNewSpace, setIsCreatingNewSpace] = useState(false);
    const [isScheduledDeliveriesModalOpen, toggleSchedulerDeliveriesModel] =
        useToggle(false);
    const handleEditClick = () => {
        setIsUpdating(true);
        track({ name: EventName.UPDATE_DASHBOARD_NAME_CLICKED });
    };

    useEffect(() => {
        const schedulerUuidFromUrlParams =
            getSchedulerUuidFromUrlParams(search);
        if (schedulerUuidFromUrlParams) {
            toggleSchedulerDeliveriesModel(true);
        }
    }, [search, toggleSchedulerDeliveriesModel]);

    const { user } = useApp();
    const userCanManageDashboard = user.data?.ability.can(
        'manage',
        'Dashboard',
    );

    return (
        <PageHeader>
            <PageTitleAndDetailsContainer>
                <PageTitleContainer className={Classes.TEXT_OVERFLOW_ELLIPSIS}>
                    <PageTitle>{dashboardName}</PageTitle>

                    {dashboardDescription && (
                        <Tooltip2
                            content={dashboardDescription}
                            position="bottom"
                        >
                            <Button icon="info-sign" minimal />
                        </Tooltip2>
                    )}

                    {isEditMode && userCanManageDashboard && (
                        <Button
                            icon={<IconPencil size={16} />}
                            disabled={isSaving}
                            onClick={handleEditClick}
                            minimal
                        />
                    )}

                    {isUpdating && (
                        <DashboardUpdateModal
                            uuid={dashboardUuid}
                            isOpen={isUpdating}
                            onClose={() => setIsUpdating(false)}
                            onConfirm={() => setIsUpdating(false)}
                        />
                    )}
                </PageTitleContainer>

                <PageDetailsContainer>
                    <UpdatedInfo
                        updatedAt={dashboardUpdatedAt}
                        user={dashboardUpdatedByUser}
                    />

                    <SeparatorDot icon="dot" size={6} />

                    <ViewInfo
                        views={dashboardViews}
                        firstViewedAt={dashboardFirstViewedAt}
                    />

                    {dashboardSpaceName && (
                        <>
                            <SeparatorDot icon="dot" size={6} />

                            <SpaceAndDashboardInfo
                                space={{
                                    link: `/projects/${projectUuid}/spaces/${dashboardSpaceUuid}`,
                                    name: dashboardSpaceName,
                                }}
                            />
                        </>
                    )}
                </PageDetailsContainer>
            </PageTitleAndDetailsContainer>
            {userCanManageDashboard && isEditMode ? (
                <PageActionsContainer>
                    <AddTileButton onAddTiles={onAddTiles} />
                    <Tooltip
                        withinPortal
                        position="bottom"
                        label="No changes to save"
                        disabled={hasDashboardChanged}
                    >
                        <Box>
                            <Button
                                text="Save"
                                disabled={!hasDashboardChanged || isSaving}
                                intent={Intent.PRIMARY}
                                onClick={onSaveDashboard}
                            />
                        </Box>
                    </Tooltip>
                    <Button
                        text="Cancel"
                        disabled={isSaving}
                        onClick={onCancel}
                    />
                </PageActionsContainer>
            ) : userCanManageDashboard ? (
                <PageActionsContainer>
                    <Button
                        icon={<IconPencil size={16} />}
                        text="Edit dashboard"
                        onClick={() => {
                            history.replace(
                                `/projects/${projectUuid}/dashboards/${dashboardUuid}/edit`,
                            );
                        }}
                    />

                    <ShareLinkButton url={`${window.location.href}`} />

                    <Popover2
                        placement="bottom"
                        content={
                            <Menu>
                                <MenuItem2
                                    icon={<IconCopy />}
                                    text="Duplicate"
                                    onClick={onDuplicate}
                                />

                                <MenuItem2
                                    icon={<IconFolders />}
                                    text="Move to space"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }}
                                >
                                    {spaces?.map((spaceToMove) => {
                                        const isDisabled =
                                            dashboardSpaceUuid ===
                                            spaceToMove.uuid;
                                        return (
                                            <MenuItem2
                                                key={spaceToMove.uuid}
                                                text={spaceToMove.name}
                                                icon={
                                                    isDisabled ? (
                                                        <IconCheck />
                                                    ) : undefined
                                                }
                                                className={
                                                    isDisabled
                                                        ? 'bp4-disabled'
                                                        : ''
                                                }
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    if (
                                                        dashboardSpaceUuid !==
                                                        spaceToMove.uuid
                                                    ) {
                                                        onMoveToSpace(
                                                            spaceToMove.uuid,
                                                        );
                                                    }
                                                }}
                                            />
                                        );
                                    })}
                                    <Divider />
                                    <MenuItem2
                                        icon={<IconPlus />}
                                        text="Create new"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setIsCreatingNewSpace(true);
                                        }}
                                    />
                                </MenuItem2>
                                <MenuItem2
                                    icon={<IconSend />}
                                    text="Scheduled deliveries"
                                    onClick={() => {
                                        toggleSchedulerDeliveriesModel(true);
                                    }}
                                />
                                <MenuItem2
                                    icon={<IconUpload />}
                                    text="Export dashboard"
                                    onClick={onExport}
                                />
                                <Divider />
                                <MenuItem2
                                    icon={<IconTrash />}
                                    text="Delete"
                                    intent="danger"
                                    onClick={onDelete}
                                />
                            </Menu>
                        }
                    >
                        <Button
                            style={{ padding: '5px 7px' }}
                            icon={<IconDots size={16} />}
                        />
                    </Popover2>

                    {isCreatingNewSpace && (
                        <SpaceActionModal
                            projectUuid={projectUuid}
                            actionType={ActionType.CREATE}
                            title="Create new space"
                            confirmButtonLabel="Create"
                            icon="folder-close"
                            onClose={() => setIsCreatingNewSpace(false)}
                            onSubmitForm={(space) => {
                                if (space) onMoveToSpace(space.uuid);
                            }}
                        />
                    )}
                    {isScheduledDeliveriesModalOpen && dashboardUuid && (
                        <DashboardSchedulersModal
                            dashboardUuid={dashboardUuid}
                            name={dashboardName}
                            isOpen={isScheduledDeliveriesModalOpen}
                            onClose={() =>
                                toggleSchedulerDeliveriesModel(false)
                            }
                        />
                    )}
                </PageActionsContainer>
            ) : null}
        </PageHeader>
    );
};

export default DashboardHeader;
