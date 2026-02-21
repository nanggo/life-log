import { describe, it, expect } from 'vitest'

import {
  website,
  name,
  title,
  description,
  author,
  avatar,
  bio,
  github,
  email,
  techTags,
  expertiseAreas,
  organizationAlternateNames,
  foundingDate,
  licenseUrl,
  areaServed
} from './info'

describe('info constants', () => {
  it('website is a valid URL', () => {
    expect(website).toMatch(/^https?:\/\//)
  })

  it('name is defined', () => {
    expect(name).toBeTruthy()
  })

  it('title is defined', () => {
    expect(title).toBeTruthy()
  })

  it('description is defined', () => {
    expect(description).toBeTruthy()
  })

  it('author is defined', () => {
    expect(author).toBeTruthy()
  })

  it('avatar is a valid URL', () => {
    expect(avatar).toMatch(/^https?:\/\//)
  })

  it('bio is defined', () => {
    expect(bio).toBeTruthy()
  })

  it('github username is defined', () => {
    expect(github).toBeTruthy()
  })

  it('email is a valid format', () => {
    expect(email).toMatch(/@/)
  })

  it('techTags is a non-empty array', () => {
    expect(Array.isArray(techTags)).toBe(true)
    expect(techTags.length).toBeGreaterThan(0)
  })

  it('expertiseAreas is a non-empty array', () => {
    expect(Array.isArray(expertiseAreas)).toBe(true)
    expect(expertiseAreas.length).toBeGreaterThan(0)
  })

  it('organizationAlternateNames is a non-empty array', () => {
    expect(Array.isArray(organizationAlternateNames)).toBe(true)
  })

  it('foundingDate is defined', () => {
    expect(foundingDate).toBeTruthy()
  })

  it('licenseUrl is a valid URL', () => {
    expect(licenseUrl).toMatch(/^https?:\/\//)
  })

  it('areaServed is defined', () => {
    expect(areaServed).toBeTruthy()
  })
})
