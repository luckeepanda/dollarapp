import { supabase } from '../lib/supabase';
import { supabase } from '../lib/supabase';
import { playerQRService } from './playerQRService';

export interface RestaurantGame {
  id: string;
  restaurant_id: string;
  name: string;
  description: string;
  entry_fee: number;
  game_type?: string;
  max_players: number;
  current_players: number;
  prize_pool: number;
  min_score: number;
  status: 'active' | 'completed' | 'cancelled';
  winner_id?: string;
  winning_score?: number;
  qr_code?: string;
  qr_redeemed: boolean;
  image_url?: string;
  created_at: string;
  completed_at?: string;
  restaurant?: {
    username: string;
  };
}

export interface RestaurantGameEntry {
  id: string;
  game_id: string;
  user_id: string;
  score: number;
  completed_at: string;
  created_at: string;
  profiles?: {
    username: string;
  };
}

export interface GameResult {
  game_completed: boolean;
  winner_id?: string;
  winning_score?: number;
  qr_code?: string;
  your_score: number;
  qualified: boolean;
  entries_count: number;
  max_players: number;
  game_name?: string;
  prize_pool?: number;
}

export const restaurantGameService = {
  // Create a new restaurant game
  async createGame(
    restaurantId: string,
    name: string,
    description: string,
    entryFee: number,
    maxPlayers: number,
    minScore: number,
    gameType: string = 'taco_flyer',
    imageFile?: File
  ): Promise<string> {
    let imageUrl: string | null = null;
    
    // Upload image if provided
    if (imageFile) {
      // Validate file type before upload
      if (!imageFile.type.startsWith('image/')) {
        throw new Error('Invalid file type. Please select an image file.');
      }
      
      // Validate file size (max 5MB)
      if (imageFile.size > 5 * 1024 * 1024) {
        throw new Error('File too large. Please select an image smaller than 5MB.');
      }
      
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${restaurantId}/${Date.now()}.${fileExt}`;
      
      console.log('Uploading image:', {
        fileName,
        fileType: imageFile.type,
        fileSize: imageFile.size,
        fileSizeFormatted: `${(imageFile.size / 1024 / 1024).toFixed(2)}MB`
      });
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('game-images')
        .upload(fileName, imageFile, {
          cacheControl: '3600',
          upsert: false,
          contentType: imageFile.type,
          duplex: 'half'
        });
      
      if (uploadError) {
        console.error('Error uploading image:', uploadError, {
          fileName,
          fileType: imageFile.type,
          fileSize: imageFile.size,
          errorCode: uploadError.statusCode,
          errorMessage: uploadError.message
        });
        throw new Error(`Failed to upload image: ${uploadError.message}`);
      }
      
      console.log('Image uploaded successfully:', uploadData);
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('game-images')
        .getPublicUrl(fileName);
      
      imageUrl = urlData.publicUrl;
      console.log('Generated public URL:', imageUrl);
    }

    const { data, error } = await supabase.rpc('create_restaurant_game', {
      p_restaurant_id: restaurantId,
      p_name: name,
      p_description: description,
      p_entry_fee: entryFee,
      p_max_players: maxPlayers,
      p_min_score: minScore,
      p_game_type: gameType,
      p_image_url: imageUrl
    });

    if (error) {
      console.error('Error creating restaurant game:', error);
      throw error;
    }

    return data;
  },

  // Upload game image
  async uploadGameImage(file: File, restaurantId: string): Promise<string> {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('Invalid file type. Please select an image file.');
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File too large. Please select an image smaller than 5MB.');
    }
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${restaurantId}/${Date.now()}.${fileExt}`;
    
    console.log('Direct image upload:', {
      fileName,
      fileType: file.type,
      fileSize: file.size,
      fileSizeFormatted: `${(file.size / 1024 / 1024).toFixed(2)}MB`
    });
    
    const { data, error } = await supabase.storage
      .from('game-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
        duplex: 'half'
      });
    
    if (error) {
      console.error('Error uploading direct image:', error, {
        fileName,
        fileType: file.type,
        fileSize: file.size,
        errorCode: error.statusCode,
        errorMessage: error.message
      });
      throw new Error(`Failed to upload image: ${error.message}`);
    }
    
    console.log('Direct image uploaded successfully:', data);
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('game-images')
      .getPublicUrl(fileName);
    
    console.log('Generated direct public URL:', urlData.publicUrl);
    return urlData.publicUrl;
  },

  // Get all active restaurant games
  async getActiveGames(): Promise<RestaurantGame[]> {
    const { data, error } = await supabase
      .from('restaurant_games')
      .select(`
        *,
        restaurant:profiles!restaurant_games_restaurant_id_fkey(username)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching active games:', error);
      throw error;
    }

    return data || [];
  },

  // Get restaurant's games
  async getRestaurantGames(restaurantId: string): Promise<RestaurantGame[]> {
    const { data, error } = await supabase
      .from('restaurant_games')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching restaurant games:', error);
      throw error;
    }

    return data || [];
  },

  // Delete a restaurant game
  async deleteGame(gameId: string): Promise<void> {
    const { error } = await supabase
      .from('restaurant_games')
      .delete()
      .eq('id', gameId);

    if (error) {
      console.error('Error deleting restaurant game:', error);
      throw error;
    }
  },

  // Join a restaurant game
  async joinGame(gameId: string, userId: string): Promise<boolean> {
    const { error } = await supabase.rpc('join_restaurant_game', {
      p_game_id: gameId,
      p_user_id: userId
    });

    if (error) {
      console.error('Error joining restaurant game:', error);
      throw error;
    }

    return true;
  },

  // Submit score to restaurant game
  async submitScore(gameId: string, userId: string, score: number): Promise<GameResult> {
    const { data, error } = await supabase.rpc('submit_restaurant_game_score', {
      p_game_id: gameId,
      p_user_id: userId,
      p_score: score
    });

    if (error) {
      console.error('Error submitting restaurant game score:', error);
      throw error;
    }

    // If game is completed and user is the winner, create QR code in player_qr_codes table
    if (data && data.game_completed && data.winner_id === userId) {
      try {
        console.log('Creating restaurant game QR code for winner:', userId);
        // Use game details from the RPC response
        if (data.game_name && data.prize_pool !== undefined) {
          const qrCode = await playerQRService.createRestaurantGameQRCode(
            userId,
            gameId,
            data.game_name,
            data.prize_pool
          );
          
          // Add QR code to the result
          data.qr_code = qrCode;
          console.log('Restaurant game QR code created successfully:', qrCode);
        } else {
          console.error('Game details missing from response when creating QR code');
          throw new Error('Game completed but QR code creation failed. Please contact support.');
        }
      } catch (qrError) {
        console.error('Failed to create restaurant game QR code:', qrError);
        // Don't fail the game completion if QR creation fails
        throw new Error('Game completed but QR code creation failed. Please contact support.');
      }
    }

    return data;
  },

  // Get game entries/results
  async getGameEntries(gameId: string): Promise<RestaurantGameEntry[]> {
    const { data, error } = await supabase
      .from('restaurant_game_entries')
      .select(`
        *,
        profiles(username)
      `)
      .eq('game_id', gameId)
      .order('score', { ascending: false });

    if (error) {
      console.error('Error fetching game entries:', error);
      throw error;
    }

    return data || [];
  },

  // Get game details
  async getGame(gameId: string): Promise<RestaurantGame | null> {
    const { data, error } = await supabase
      .from('restaurant_games')
      .select(`
        *,
        restaurant:profiles!restaurant_games_restaurant_id_fkey(username)
      `)
      .eq('id', gameId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching game:', error);
      throw error;
    }

    return data || null;
  },

  // Check if user has already played this game
  async hasUserPlayed(gameId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('restaurant_game_entries')
      .select('id')
      .eq('game_id', gameId)
      .eq('user_id', userId)
      .limit(1);

    if (error) {
      console.error('Error checking user participation:', error);
      return false;
    }

    return (data && data.length > 0);
  },

  // Get user's entry count for a game
  async getUserEntryCount(gameId: string, userId: string): Promise<number> {
    const { data, error } = await supabase
      .from('restaurant_game_entries')
      .select('id')
      .eq('game_id', gameId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error getting user entry count:', error);
      return 0;
    }

    return data ? data.length : 0;
  },

  // Get user's best score for a game
  async getUserBestScore(gameId: string, userId: string): Promise<number> {
    const { data, error } = await supabase.rpc('get_user_best_score_for_game', {
      p_game_id: gameId,
      p_user_id: userId
    });

    if (error) {
      console.error('Error getting user best score:', error);
      return 0;
    }

    return data || 0;
  },

  // Redeem QR code
  async redeemQR(qrCode: string, restaurantId: string, approved: boolean = true, rejectionReason?: string): Promise<any> {
    // Use the existing player QR service for redemption
    return await playerQRService.redeemQRCode(qrCode, restaurantId, approved, rejectionReason);
  }
};