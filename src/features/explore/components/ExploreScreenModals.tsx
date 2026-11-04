import React from 'react';
import { AnimatePresence } from 'motion/react';
import { VenueDetailSheet } from './VenueDetailSheet';
import { ProximityValidator } from './ProximityValidator';
import { ActiveFlashModal } from './ActiveFlashModal';
import { FlashListModal } from './FlashListModal';
import { TrailDetailModal } from './TrailDetailModal';
import { CreateTrailModal } from './CreateTrailModal';

interface ExploreScreenModalsProps {
  selectedVenue: any;
  setSelectedVenue: (v: any) => void;
  coords: any;
  scannedVenues: any;
  handleVerifyVenue: any;
  canValidateVenue: any;
  validatingVenue: any;
  setValidatingVenue: (v: any) => void;
  fireHaptic: (style: 'light' | 'medium' | 'heavy') => void;
  profile: any;
  getScrollHideStyles: any;
  modalRef: any;
  setScannedVenues: any;
  activeFlashModal: any;
  setActiveFlashModal: any;
  setCoords: any;
  updateProfilePoints: any;
  setFlashEvents: any;
  showFlashListModal: boolean;
  setShowFlashListModal: (show: boolean) => void;
  flashEvents: any;
  isListExpanded: boolean;
  setIsListExpanded: (exp: boolean) => void;
  permissionStatus: any;
  requestBrowserPermission: any;
  notifSettings: any;
  updateNotifSettings: any;
  selectedTrail: any;
  setSelectedTrail: (t: any) => void;
  userId: any;
  toggleSaveTrail: any;
  handleAdoptTrail: any;
  handleHireGuardianFromTrail: any;
  setCityName: any;
  queryOverpassAPI: any;
  selectedCategory: any;
  showCreateTrailModal: boolean;
  setShowCreateTrailModal: (show: boolean) => void;
  setAdoptingTrail: (t: any) => void;
  adoptingTrail: any;
  createModalIsTour: boolean;
  createTrail: any;
}

export const ExploreScreenModals: React.FC<ExploreScreenModalsProps> = (props) => {
  return (
    <>
      <AnimatePresence>
        {props.selectedVenue && (
          <VenueDetailSheet
            selectedVenue={props.selectedVenue}
            handleSelectVenue={props.setSelectedVenue}
            coords={props.coords}
            scannedVenues={props.scannedVenues}
            handleVerifyVenue={props.handleVerifyVenue}
            canValidateVenue={props.canValidateVenue}
            setValidatingVenue={props.setValidatingVenue}
            fireHaptic={props.fireHaptic}
            profile={props.profile}
            getScrollHideStyles={props.getScrollHideStyles}
            modalRef={props.modalRef}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {props.validatingVenue && (
          <ProximityValidator
            validatingVenue={props.validatingVenue}
            setValidatingVenue={props.setValidatingVenue}
            onClose={() => props.setValidatingVenue(null)}
            canValidateVenue={props.canValidateVenue}
            profile={props.profile}
            updateProfilePoints={props.updateProfilePoints}
            setScannedVenues={props.setScannedVenues}
            onCompleteValidation={(id, success) => {
              if (success && props.setScannedVenues) {
                props.setScannedVenues((prev: any) => ({ ...prev, [id]: true }));
              }
            }}
            fireHaptic={props.fireHaptic}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {props.activeFlashModal && (
          <ActiveFlashModal
            activeFlashModal={props.activeFlashModal}
            setActiveFlashModal={props.setActiveFlashModal}
            coords={props.coords}
            setCoords={props.setCoords}
            profile={props.profile}
            updateProfilePoints={props.updateProfilePoints}
            setFlashEvents={props.setFlashEvents}
            fireHaptic={props.fireHaptic}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {props.showFlashListModal && (
          <FlashListModal
            showFlashListModal={props.showFlashListModal}
            setShowFlashListModal={props.setShowFlashListModal}
            flashEvents={props.flashEvents}
            setActiveFlashModal={props.setActiveFlashModal}
            isListExpanded={props.isListExpanded}
            setIsListExpanded={props.setIsListExpanded}
            permissionStatus={props.permissionStatus}
            requestBrowserPermission={props.requestBrowserPermission}
            notifSettings={props.notifSettings}
            updateNotifSettings={props.updateNotifSettings}
            coords={props.coords}
            fireHaptic={props.fireHaptic}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {props.selectedTrail && (
          <TrailDetailModal
            trail={props.selectedTrail}
            onClose={() => props.setSelectedTrail(null)}
            userId={props.userId}
            currentUserProfile={props.profile}
            onToggleSave={props.toggleSaveTrail}
            onAdoptTrail={props.handleAdoptTrail}
            onHireGuardian={props.handleHireGuardianFromTrail}
            onCenterRadar={(radarCoords, label) => {
              props.setCoords(radarCoords);
              props.setCityName(label);
              props.queryOverpassAPI(radarCoords.lat, radarCoords.lng, props.selectedCategory || 'Cafés');
            }}
            fireHaptic={props.fireHaptic}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {props.showCreateTrailModal && (
          <CreateTrailModal
            isOpen={props.showCreateTrailModal}
            onClose={() => {
              props.setShowCreateTrailModal(false);
              props.setAdoptingTrail(null);
            }}
            userId={props.userId}
            authorName={props.profile?.handle}
            userCoords={props.coords}
            fireHaptic={props.fireHaptic}
            isProGuardian={Boolean(props.profile?.isProGuardian || props.profile?.guardianshipType === 'pro')}
            initialIsTour={props.createModalIsTour}
            initialTrailData={
              props.adoptingTrail
                ? {
                    forkedFromTrailId: props.adoptingTrail.id,
                    forkedFromAuthorName: props.adoptingTrail.authorName,
                    name: props.adoptingTrail.name,
                    city: props.adoptingTrail.city,
                    story: props.adoptingTrail.story,
                    category: props.adoptingTrail.category,
                    vibeTags: props.adoptingTrail.vibeTags,
                    imageUrl: props.adoptingTrail.imageUrl,
                    stops: props.adoptingTrail.stops,
                  }
                : null
            }
            onSubmitTrail={props.createTrail}
          />
        )}
      </AnimatePresence>
    </>
  );
};
