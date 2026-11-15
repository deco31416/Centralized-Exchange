export interface OnboardingFormData {
  email: string
  password: string
  confirmPassword: string
  acceptTerms: boolean
  acceptAge?: boolean
  acceptPrivacy?: boolean
  acceptLegalFunds?: boolean
  acceptRisk?: boolean
  acceptJurisdiction?: boolean
}

export interface OnboardingStepProps {
  data: OnboardingFormData
  update: (key: keyof OnboardingFormData, value: string | boolean) => void
  onNext: () => void
  onBack: () => void
}
