# Pages Structure

This folder groups screen components by app area and user role.

## Sections

- `public`: public-facing pages such as landing and profile display
- `auth`: login, register, and account access flows
- `user`: standard user dashboard pages and user tools
- `company`: company dashboard pages and company flows
- `admin`: admin dashboard pages and moderation or management flows

## Guidance

- Put each screen-level route component in the matching role folder
- Keep shared non-page UI out of this folder and place it in `components`
- Use the folder `index.ts` files to keep route imports clean
