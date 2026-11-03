import React from 'react';
import { AnimatePresence } from 'motion/react';
import { DonationModal } from './DonationModal';
import { CreateCommunityModal } from './CreateCommunityModal';
import { EditVibeModal } from './EditVibeModal';
import { JoinVibeModal } from './JoinVibeModal';
import { VibeCircleMembersModal } from './VibeCircleMembersModal';
import { EchoConnectionModal } from './EchoConnectionModal';
import { ShareVibeModal } from './ShareVibeModal';

interface ShareGoodVibesModalsProps {
  showShareVibeModal: boolean;
  setShowShareVibeModal: (show: boolean) => void;
  vibeCaptureStep: any;
  setVibeCaptureStep: any;
  vibeCaptureTimestamp: any;
  setVibeCaptureTimestamp: any;
  currentTime: any;
  setCurrentTime: any;
  vibeCapturedImage: any;
  setVibeCapturedImage: any;
  vibeCapturedFrontImage: any;
  setVibeCapturedFrontImage: any;
  isVibeVideo: any;
  setIsVibeVideo: any;
  vibeCaptureLat: any;
  setVibeCaptureLat: any;
  vibeCaptureLng: any;
  setVibeCaptureLng: any;
  newVibeLocation: any;
  setNewVibeLocation: any;
  isFlashActive: any;
  gpsStatus: any;
  setGpsStatus: any;
  frontPos: any;
  handlePointerDown: any;
  handlePointerMove: any;
  handlePointerUp: any;
  handleVibePublishSubmit: any;
  handleResetCamera: any;
  newVibeNote: any;
  setNewVibeNote: any;
  newVibeTag: any;
  setNewVibeTag: any;
  selectedVibeEmoji: any;
  setSelectedVibeEmoji: any;
  shareModalRef: any;
  activeEchoVibe: any;
  setActiveEchoVibe: any;
  userEchoNote: any;
  setUserEchoNote: any;
  attachPhotoToEcho: any;
  setAttachPhotoToEcho: any;
  echoCapturedImage: any;
  setEchoCapturedImage: any;
  echoCapturedFrontImage: any;
  setEchoCapturedFrontImage: any;
  echoCaptureTimestamp: any;
  setEchoCaptureTimestamp: any;
  handleEchoPublishSubmit: any;
  activeJoinVibe: any;
  setActiveJoinVibe: any;
  userJoinNote: any;
  setUserJoinNote: any;
  attachPhotoToJoin: any;
  setAttachPhotoToJoin: any;
  joinCapturedImage: any;
  setJoinCapturedImage: any;
  joinCapturedFrontImage: any;
  setJoinCapturedFrontImage: any;
  joinCaptureTimestamp: any;
  setJoinCaptureTimestamp: any;
  handleJoinVibeSubmit: any;
  activeCircleVibe: any;
  setActiveCircleVibe: any;
  vibeEchoes: any;
  setVibeEchoes: any;
  handleConvertCircleToCommunity: any;
  showCreateCommunity: boolean;
  setShowCreateCommunity: (show: boolean) => void;
  newCommName: any;
  setNewCommName: any;
  isHandleManuallyEdited: any;
  setIsHandleManuallyEdited: any;
  newCommHandle: any;
  setNewCommHandle: any;
  commHandleStatus: any;
  newCommEmoji: any;
  setNewCommEmoji: any;
  newCommTag: any;
  setNewCommTag: any;
  newCommCat: any;
  setNewCommCat: any;
  customCategory: any;
  setCustomCategory: any;
  commGpsStatus: any;
  commAddress: any;
  setCommAddress: any;
  commLat: any;
  commLng: any;
  newCommDesc: any;
  setNewCommDesc: any;
  newCommPrivate: any;
  setNewCommPrivate: any;
  handleDeployCommunity: any;
  showDonationModal: boolean;
  setShowDonationModal: (show: boolean) => void;
  updateProfilePoints: any;
  editingVibe: any;
  setEditingVibe: any;
  handleEditVibe: any;
  triggerHaptic: any;
}

export const ShareGoodVibesModals: React.FC<ShareGoodVibesModalsProps> = (props) => {
  return (
    <>
      <AnimatePresence>
        {props.showShareVibeModal && (
          <ShareVibeModal
            showShareVibeModal={props.showShareVibeModal}
            onClose={() => props.setShowShareVibeModal(false)}
            vibeCaptureStep={props.vibeCaptureStep}
            setVibeCaptureStep={props.setVibeCaptureStep}
            vibeCaptureTimestamp={props.vibeCaptureTimestamp}
            setVibeCaptureTimestamp={props.setVibeCaptureTimestamp}
            currentTime={props.currentTime}
            setCurrentTime={props.setCurrentTime}
            vibeCapturedImage={props.vibeCapturedImage}
            setVibeCapturedImage={props.setVibeCapturedImage}
            vibeCapturedFrontImage={props.vibeCapturedFrontImage}
            setVibeCapturedFrontImage={props.setVibeCapturedFrontImage}
            isVibeVideo={props.isVibeVideo}
            setIsVibeVideo={props.setIsVibeVideo}
            vibeCaptureLat={props.vibeCaptureLat}
            setVibeCaptureLat={props.setVibeCaptureLat}
            vibeCaptureLng={props.vibeCaptureLng}
            setVibeCaptureLng={props.setVibeCaptureLng}
            newVibeLocation={props.newVibeLocation}
            setNewVibeLocation={props.setNewVibeLocation}
            isFlashActive={props.isFlashActive}
            gpsStatus={props.gpsStatus}
            setGpsStatus={props.setGpsStatus}
            frontPos={props.frontPos}
            handlePointerDown={props.handlePointerDown}
            handlePointerMove={props.handlePointerMove}
            handlePointerUp={props.handlePointerUp}
            handleVibePublishSubmit={props.handleVibePublishSubmit}
            handleResetCamera={props.handleResetCamera}
            newVibeNote={props.newVibeNote}
            setNewVibeNote={props.setNewVibeNote}
            newVibeTag={props.newVibeTag}
            setNewVibeTag={props.setNewVibeTag}
            selectedVibeEmoji={props.selectedVibeEmoji}
            setSelectedVibeEmoji={props.setSelectedVibeEmoji}
            triggerHaptic={props.triggerHaptic}
            shareModalRef={props.shareModalRef}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {props.activeEchoVibe && (
          <EchoConnectionModal
            activeEchoVibe={props.activeEchoVibe}
            onClose={() => props.setActiveEchoVibe(null)}
            userEchoNote={props.userEchoNote}
            setUserEchoNote={props.setUserEchoNote}
            attachPhotoToEcho={props.attachPhotoToEcho}
            setAttachPhotoToEcho={props.setAttachPhotoToEcho}
            echoCapturedImage={props.echoCapturedImage}
            setEchoCapturedImage={props.setEchoCapturedImage}
            echoCapturedFrontImage={props.echoCapturedFrontImage}
            setEchoCapturedFrontImage={props.setEchoCapturedFrontImage}
            echoCaptureTimestamp={props.echoCaptureTimestamp}
            setEchoCaptureTimestamp={props.setEchoCaptureTimestamp}
            handleEchoPublishSubmit={props.handleEchoPublishSubmit}
            triggerHaptic={props.triggerHaptic}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {props.activeJoinVibe && (
          <JoinVibeModal
            activeJoinVibe={props.activeJoinVibe}
            onClose={() => props.setActiveJoinVibe(null)}
            userJoinNote={props.userJoinNote}
            setUserJoinNote={props.setUserJoinNote}
            attachPhotoToJoin={props.attachPhotoToJoin}
            setAttachPhotoToJoin={props.setAttachPhotoToJoin}
            joinCapturedImage={props.joinCapturedImage}
            setJoinCapturedImage={props.setJoinCapturedImage}
            joinCapturedFrontImage={props.joinCapturedFrontImage}
            setJoinCapturedFrontImage={props.setJoinCapturedFrontImage}
            joinCaptureTimestamp={props.joinCaptureTimestamp}
            setJoinCaptureTimestamp={props.setJoinCaptureTimestamp}
            handleJoinVibeSubmit={props.handleJoinVibeSubmit}
            triggerHaptic={props.triggerHaptic}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {props.activeCircleVibe && (
          <VibeCircleMembersModal
            activeCircleVibe={props.activeCircleVibe}
            onClose={() => props.setActiveCircleVibe(null)}
            vibeEchoes={props.vibeEchoes}
            setVibeEchoes={props.setVibeEchoes}
            handleConvertCircleToCommunity={props.handleConvertCircleToCommunity}
            triggerHaptic={props.triggerHaptic}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {props.showCreateCommunity && (
          <CreateCommunityModal
            onClose={() => props.setShowCreateCommunity(false)}
            newCommName={props.newCommName}
            setNewCommName={props.setNewCommName}
            isHandleManuallyEdited={props.isHandleManuallyEdited}
            setIsHandleManuallyEdited={props.setIsHandleManuallyEdited}
            newCommHandle={props.newCommHandle}
            setNewCommHandle={props.setNewCommHandle}
            commHandleStatus={props.commHandleStatus}
            newCommEmoji={props.newCommEmoji}
            setNewCommEmoji={props.setNewCommEmoji}
            newCommTag={props.newCommTag}
            setNewCommTag={props.setNewCommTag}
            newCommCat={props.newCommCat}
            setNewCommCat={props.setNewCommCat}
            customCategory={props.customCategory}
            setCustomCategory={props.setCustomCategory}
            commGpsStatus={props.commGpsStatus}
            commAddress={props.commAddress}
            setCommAddress={props.setCommAddress}
            commLat={props.commLat}
            commLng={props.commLng}
            newCommDesc={props.newCommDesc}
            setNewCommDesc={props.setNewCommDesc}
            newCommPrivate={props.newCommPrivate}
            setNewCommPrivate={props.setNewCommPrivate}
            handleDeployCommunity={props.handleDeployCommunity}
            triggerHaptic={props.triggerHaptic}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {props.showDonationModal && (
          <DonationModal
            onClose={() => props.setShowDonationModal(false)}
            updatePoints={props.updateProfilePoints}
            triggerHaptic={props.triggerHaptic}
          />
        )}
      </AnimatePresence>

      <EditVibeModal
        isOpen={!!props.editingVibe}
        onClose={() => props.setEditingVibe(null)}
        vibeId={props.editingVibe?.id || ''}
        initialText={props.editingVibe?.text || ''}
        onSave={(id, newText) => props.handleEditVibe(id, newText)}
      />
    </>
  );
};
