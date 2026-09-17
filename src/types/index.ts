export type Role = "ADMIN" | "EMPLOYEE";

export type AccessStatus = "PENDING" | "APPROVED" | "DENIED" | "REVOKED";

export type InspectionStatus = "ASSIGNED" | "IN_PROGRESS" | "SUBMITTED" | "REVIEWED";

export type RoomType = "LIVING" | "BEDROOM" | "PASSAGE" | "KITCHEN" | "BALCONY" | "WASHROOM";

export type SketchType = "FLAT" | "BUILDING";

export interface UserSession {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: Role;
  status: AccessStatus;
}

export interface UserDTO {
  id: string;
  googleId?: string;
  name: string;
  email: string;
  image?: string;
  role: Role;
  status: AccessStatus;
  lastLoginAt: string;
  createdAt: string;
}

export interface AccessRequestDTO {
  id: string;
  userId: string;
  name: string;
  email: string;
  image?: string;
  googleId?: string;
  status: AccessStatus;
  requestDate: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface RoomMeasurement {
  id?: string;
  type: RoomType;
  roomNumber?: number; // Bedroom 1, Washroom 2, etc.
  length?: number;
  width?: number;
  area?: number;
  manualOverride?: boolean;
  unit: string;
}

export interface CompassDirectionDTO {
  target: "FLAT" | "BUILDING";
  north?: string;
  south?: string;
  east?: string;
  west?: string;
}

export interface GpsLocationDTO {
  latitude: number;
  longitude: number;
  capturedAt?: string;
}

export interface LandmarkDTO {
  id?: string;
  name: string;
  description?: string;
  distance?: string;
}

export interface NearbyFacilityDTO {
  facilityKey: string;
  facilityLabel: string;
  placeName?: string;
  distance?: number;
  unit: string;
}

export interface SketchDTO {
  id?: string;
  type: SketchType;
  fileUrl: string;
  uploadedAt?: string;
}

export interface SitePhotoDTO {
  id?: string;
  fileUrl: string;
  caption?: string;
  latitude?: number;
  longitude?: number;
  uploadedAt?: string;
}

export interface FullInspectionData {
  id: string;
  title: string;
  address?: string;
  siteCoordinator?: string;
  engineerName?: string;
  buildingName?: string;
  totalFloors?: number;
  flatFloor?: number;
  status: InspectionStatus;
  assignedToId: string;
  assignedToName?: string;
  assignedToEmail?: string;
  createdById: string;
  assignedDate: string;
  submissionDate?: string;
  createdAt: string;
  updatedAt: string;

  rooms?: RoomMeasurement[];
  compassDirections?: CompassDirectionDTO[];
  gpsLocation?: GpsLocationDTO | null;
  carpetDetail?: { carpetArea?: number; unit: string } | null;
  landmarks?: LandmarkDTO[];
  nearbyFacilities?: NearbyFacilityDTO[];
  sketches?: SketchDTO[];
  sitePhotos?: SitePhotoDTO[];
}
