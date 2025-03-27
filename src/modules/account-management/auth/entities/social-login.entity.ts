// import { BaseEntity } from '@/database/entities/base.entity';
// import { User } from '@/modules/users/entities/user.entity';
// import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

// /**
//  * Entity for storing social authentication credentials
//  * 
//  * This entity tracks all social logins connected to user accounts,
//  * allowing a single user to authenticate through multiple providers
//  * (e.g., Google, Facebook, GitHub, etc.)
//  */
// @Entity('social_logins')
// export class SocialLogin extends BaseEntity<SocialLogin> {
//   /**
//    * The authentication provider (google, facebook, github, etc.)
//    */
//   @Column()
//   provider!: string;

//   /**
//    * Unique identifier from the provider (e.g., Google's user ID)
//    */
//   @Column()
//   @Index()
//   providerId!: string;

//   /**
//    * Relationship to the user account
//    */
//   @ManyToOne(() => User, (user) => user.socialLogins, {
//     onDelete: 'CASCADE', // Delete social login records when user is deleted
//   })
//   @JoinColumn({ name: 'user_id' })
//   user!: User;

//   /**
//    * Foreign key for the user relationship
//    */
//   @Column({ name: 'user_id' })
//   userId!: string;

//   /**
//    * When the user last logged in with this provider
//    */
//   @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
//   lastLogin?: Date;

//   /**
//    * Access token from the provider (encrypted)
//    * Optional: Only store if needed for API calls
//    */
//   @Column({ nullable: true })
//   accessToken?: string;

//   /**
//    * Refresh token from the provider (encrypted)
//    * Optional: Only store if needed for token renewal
//    */
//   @Column({ nullable: true })
//   refreshToken?: string;

//   /**
//    * When the access token expires
//    * Optional: Only store if tracking token expiration
//    */
//   @Column({ nullable: true })
//   tokenExpiry?: Date;

//   /**
//    * Additional provider-specific data as JSON
//    * Optional: For storing extra profile information
//    */
//   @Column({ type: 'json', nullable: true })
//   metadata?: Record<string, any>;

//   /**
//    * Combined unique constraint ensures a user can connect
//    * to each provider only once
//    */
//   @Index(['userId', 'provider', 'providerId'], { unique: true })
//   uniqueUserProvider!: string;
// }